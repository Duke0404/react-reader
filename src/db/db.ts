import Dexie, { type EntityTable } from "dexie"
import { Book } from "../interfaces/book"
import { bookSchema } from "./bookSchema"

const db = new Dexie("ReactReaderDB") as Dexie & {
	books: EntityTable<
		Book,
		"id" // primary key "id" (for the typings only)
	>
}

// Schema declaration:
db.version(2).stores({
	books: bookSchema
}).upgrade(tx => {
	// Migration: Re-index existing books with lastReadTime and addTime
	return tx.table("books").toCollection().modify(book => {
		// Ensure these fields exist (they should already be in the data)
		if (!book.lastReadTime) book.lastReadTime = book.addTime || Date.now()
		if (!book.addTime) book.addTime = Date.now()
	})
})

export { db }
