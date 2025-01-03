import Dexie, { type EntityTable } from "dexie"

interface Book {
	id: number
	title: string
	author?: string
	currentPage: number
	totalPages: number
	cover?: Blob
	data: Blob
}

const db = new Dexie("FriendsDatabase") as Dexie & {
	books: EntityTable<
		Book,
		"id" // primary key "id" (for the typings only)
	>
}

// Schema declaration:
db.version(1).stores({
	books: "++id, title, data" // primary key "id" (for the runtime!)
})

export type { Book }
export { db }
