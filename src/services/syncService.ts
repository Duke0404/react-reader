import { db } from "../db/db"
import { Book } from "../interfaces/book"
import { BackendClient } from "../clients/backendClient"

// Convert File to base64 string
async function fileToBase64(file: File | null): Promise<string | null> {
	if (!file) return null
	
	return new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = reject
		reader.readAsDataURL(file)
	})
}

// Convert base64 string to File
async function base64ToFile(base64: string | null, filename: string): Promise<File | null> {
	if (!base64) return null
	
	try {
		const response = await fetch(base64)
		const blob = await response.blob()
		return new File([blob], filename, { type: blob.type })
	} catch (error) {
		console.error("Error converting base64 to file:", error)
		return null
	}
}

// Convert books to backend format (with base64 files)
async function booksToBackendFormat(books: Book[]): Promise<any[]> {
	return Promise.all(books.map(async book => ({
		...book,
		cover: await fileToBase64(book.cover),
		data: await fileToBase64(book.data)
	})))
}

// Convert books from backend format (base64 to Files)
async function booksFromBackendFormat(backendBooks: any[]): Promise<Book[]> {
	return Promise.all(backendBooks.map(async book => ({
		...book,
		cover: await base64ToFile(book.cover, `cover-${book.id}.jpg`),
		data: await base64ToFile(book.data, `${book.title}.pdf`)
	})))
}

export class SyncService {
	private backend: BackendClient
	
	constructor(backend: BackendClient) {
		this.backend = backend
	}
	
	// Get the latest timestamp from local IndexedDB
	async getLocalTimestamp(): Promise<number> {
		const books = await db.books.toArray()
		if (books.length === 0) return 0
		return Math.max(...books.map(b => b.lastReadTime || b.addTime))
	}
	
	// Sync library with backend
	async sync(forcePush: boolean = false): Promise<{ success: boolean; message: string }> {
		if (!this.backend.isSet()) {
			return { success: false, message: "Backend not configured" }
		}
		
		const authValid = await this.backend.isAuthValid()
		if (authValid === false) {
			return { success: false, message: "Not authenticated" }
		} else if (authValid === null) {
			// Backend unreachable - skip sync but don't error
			return { success: true, message: "Offline mode - sync skipped" }
		}
		
		try {
			// If forcePush is true, skip timestamp check and upload immediately
			if (forcePush) {
				return await this.uploadLibrary()
			}
			
			// Get timestamps from both sides
			const localTimestamp = await this.getLocalTimestamp()
			const response = await fetch(`${this.backend.url}/library/timestamp`, {
				credentials: "include",
				headers: { "Content-Type": "application/json" }
			})
			
			if (!response.ok) {
				// If unauthorized, return error, otherwise assume offline
				if (response.status === 401 || response.status === 403) {
					return { success: false, message: "Not authenticated" }
				}
				return { success: true, message: "Offline mode - sync skipped" }
			}
			
			const { lastUpdated: serverTimestamp } = await response.json()
			
			// Compare timestamps and sync accordingly
			if (localTimestamp > serverTimestamp) {
				// Local is newer - upload to server
				return await this.uploadLibrary()
			} else if (serverTimestamp > localTimestamp) {
				// Server is newer - download from server
				return await this.downloadLibrary()
			} else {
				// Already in sync
				return { success: true, message: "Library already in sync" }
			}
		} catch (error) {
			// Network error - operate in offline mode
			console.log("Network error during sync, continuing in offline mode:", error)
			return { success: true, message: "Offline mode - sync skipped" }
		}
	}
	
	// Upload local library to server
	private async uploadLibrary(): Promise<{ success: boolean; message: string }> {
		try {
			const localBooks = await db.books.toArray()
			const backendBooks = await booksToBackendFormat(localBooks)
			// Use current time as timestamp to ensure server knows this is the latest
			const timestamp = Date.now()
			
			const response = await fetch(`${this.backend.url}/library`, {
				method: "PUT",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ books: backendBooks, lastUpdated: timestamp })
			})
			
			if (!response.ok) {
				return { success: false, message: "Failed to upload library" }
			}
			
			return { success: true, message: `Uploaded ${localBooks.length} books` }
		} catch (error) {
			// Network error during upload - treat as offline
			console.log("Network error during upload, continuing in offline mode:", error)
			return { success: true, message: "Offline mode - upload skipped" }
		}
	}
	
	// Download library from server
	private async downloadLibrary(): Promise<{ success: boolean; message: string }> {
		try {
			const response = await fetch(`${this.backend.url}/library`, {
				credentials: "include",
				headers: { "Content-Type": "application/json" }
			})
			
			if (!response.ok) {
				return { success: false, message: "Failed to download library" }
			}
			
			const { books: backendBooks } = await response.json()
			
			// Clear local library and replace with server version
			await db.books.clear()
			const books = await booksFromBackendFormat(backendBooks)
			
			for (const book of books) {
				if (book.data) { // Only add if PDF data exists
					await db.books.add(book)
				}
			}
			
			return { success: true, message: `Downloaded ${books.length} books` }
		} catch (error) {
			// Network error during download - treat as offline
			console.log("Network error during download, continuing in offline mode:", error)
			return { success: true, message: "Offline mode - download skipped" }
		}
	}
}
