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
db.version(1).stores({
	books: bookSchema
})

export { db }
