import Dexie, { type EntityTable } from "dexie"
import { ReaderSettings } from "../interfaces/readerSettings"

interface Book {
	id: number
	title: string
	author: string | null
	currentPage: number
	totalPages: number
	cover: File | null
	data: File
	lastReadPage: number
	addTime: number
	lastReadTime: number
	settings: ReaderSettings
}

const db = new Dexie("FriendsDatabase") as Dexie & {
	books: EntityTable<
		Book,
		"id" // primary key "id" (for the typings only)
	>
}

// Schema declaration:
db.version(1).stores({
	books: "++id, title, author, currentPage, totalPages, cover, data, lastReadPage, settings" // primary key "id" (for the runtime!)
})

export type { Book }
export { db }
