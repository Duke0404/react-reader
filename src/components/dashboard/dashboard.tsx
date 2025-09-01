import { useLiveQuery } from "dexie-react-hooks"
import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { Button, FileTrigger } from "react-aria-components"
import { MdAdd } from "react-icons/md"
import { pdfjs } from "react-pdf"

import { BookContext } from "../../contexts/book"
import { SortConfigContext } from "../../contexts/sortConfig"
import { SyncContext } from "../../contexts/sync"
import { colorModes } from "../../data/colorModes"
import { db } from "../../db/db"
import { SortBy } from "../../enums/booksSortBy"
import { ProgressInfoType } from "../../enums/progressInfoType"
import { ReadingDirection } from "../../enums/readingDirection"
import { Book } from "../../interfaces/book"
import { SortConfig } from "../../interfaces/sortConfig"
import BookInfo from "./bookInfo/bookInfo"
import styles from "./dashboard.module.css"
import OptionsBar from "./optionsBar/optionsBar"
import Placeholder from "./placeholder/placeholder"

export default function Dashboard() {
	const [fileError, setFileError] = useState("")
	const [books, setBooks] = useState<Book[]>([])

	const sortConfigSavedValue = useMemo(() => {
		const savedValue = localStorage.getItem("sortConfig")
		if (!savedValue) return null
		console.log("Saved value:", savedValue)
		return JSON.parse(savedValue) as SortConfig
	}, [])

	const [sortConfig, setSortConfig] = useState<SortConfig>(
		sortConfigSavedValue || {
			sortBy: SortBy.LastRead,
			desc: false
		}
	)

	const sortBooks = useCallback(
		(a: Book, b: Book) => {
			let res = 0

			switch (sortConfig.sortBy) {
				case SortBy.Title:
					res = a.title.localeCompare(b.title)
					break
				case SortBy.Author:
					res = (a.author || "").localeCompare(b.author || "")
					break
				case SortBy.LastRead:
					res = b.lastReadTime - a.lastReadTime
					break
				case SortBy.LastAdded:
					res = b.addTime - a.addTime
					break
			}

			return res * (sortConfig.desc ? -1 : 1)
		},
		[sortConfig.sortBy, sortConfig.desc]
	)

	// Sort books based on sort config
	useEffect(() => {
		localStorage.setItem("sortConfig", JSON.stringify(sortConfig))
		// Create a new sorted array instead of mutating
		setBooks(prevBooks => [...prevBooks].sort(sortBooks))
	}, [sortConfig, sortBooks])

	// Fetch books from the indexedDB
	useLiveQuery(async () => {
		const allBooks = await db.books.toArray()
		setBooks(allBooks.sort(sortBooks))
	}, [sortBooks])

	// Send uploaded file to the indexedDB
	async function handleFileUpload(files: FileList | null) {
		if (files) {
			for (const file of files) {
				try {
					const estimate = await navigator.storage.estimate()
					const availableSpace =
						estimate && estimate.quota && estimate.usage
							? estimate.quota - estimate.usage
							: null
					if (availableSpace && file.size > availableSpace) {
						setFileError("Not enough space")
					}
				} catch (error) {
					console.error(error)
					setFileError("Error checking available space")
				}

				try {
					const arrayBuffer = await file.arrayBuffer()
					const pdf = await pdfjs.getDocument(arrayBuffer).promise
					if (!pdf) throw new Error("Error loading PDF")

					const numPages = pdf.numPages

					const metadata = await pdf.getMetadata()
					const author =
						metadata && metadata.info && "Author" in metadata.info
							? (metadata.info.Author as string)
							: null

					if (!numPages) throw new Error("Error getting number of pages")

					const title = file.name.substring(0, file.name.length - 4).replace(/_/g, " ")
					const currTime = Date.now()

					const settings = {
						bionic: {
							on: false,
							highlightSize: 3,
							highlightJump: 1,
							highlightMultiplier: 4,
							lowlightOpacity: 0.6
						},
						readAloud: {
							on: false,
							localAlways: false,
							playFullPage: true
						},
						translation: {
							on: false,
							targetLanguage: "en"
						},
						readingDirection: ReadingDirection.vertical,
						scale: 1,
						colorMode: {
							on: false,
							mode: "stdDark" as keyof typeof colorModes
						}
					}

					await db.books.add({
						title: title,
						author: author,
						data: file,
						totalPages: numPages,
						currentPage: 1,
						lastReadPage: 1,
						addTime: currTime,
						lastReadTime: currTime,
						cover: null,
						settings: settings
					})
				} catch (error) {
					console.error(error)
					setFileError("Error uploading file")
				}
			}
		}
	}

	const { syncService } = useContext(SyncContext)
	
	// Delete book from state and indexedDB
	async function deleteBook(bookId: number) {
		await db.books.delete(bookId)
		setBooks(books.filter(book => book.id !== bookId))
		// Force push to server after deletion
		if (syncService) {
			setTimeout(() => syncService.sync(true), 100)
		}
	}

	// Save changes to book in state and indexedDB
	async function changeBook(book: Book) {
		await db.books.put(book)
		setBooks(books.map(b => (b.id === book.id ? book : b)))
		// Force push to server after change
		if (syncService) {
			setTimeout(() => syncService.sync(true), 100)
		}
	}

	const [progressInfoType] = useState(ProgressInfoType.page)
	
	// Track previous book count to detect additions
	const [prevBookCount, setPrevBookCount] = useState(0)
	
	// Trigger sync when books are added (not on initial load)
	useEffect(() => {
		if (syncService && books.length > prevBookCount && prevBookCount > 0) {
			// Force push when a new book is added (not on initial load)
			const timer = setTimeout(() => syncService.sync(true), 500)
			setPrevBookCount(books.length)
			return () => clearTimeout(timer)
		} else {
			setPrevBookCount(books.length)
		}
	}, [books.length, syncService, prevBookCount])

	return (
		<>
			<SortConfigContext.Provider value={{ sortConfig, setSortConfig }}>
				<OptionsBar />
			</SortConfigContext.Provider>
			<div>
				<section className={styles.dashboard}>
					{books.length > 0 ? (
						books.map(book => (
							<>
								<BookContext.Provider
									value={{ book, deleteBook, changeBook }}
									key={book.id}
								>
									<BookInfo progressInfoType={progressInfoType} />
								</BookContext.Provider>
							</>
						))
					) : (
						<Placeholder />
					)}
				</section>

				{fileError && <div>{fileError}</div>}

				<FileTrigger
					acceptedFileTypes={["application/pdf"]}
					allowsMultiple
					onSelect={handleFileUpload}
				>
					<Button className={styles.addButton + " react-aria-Button"}>
						<MdAdd />
					</Button>
				</FileTrigger>
			</div>
		</>
	)
}
