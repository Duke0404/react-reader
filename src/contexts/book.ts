import { createContext } from "react"
import { Book } from "../db/db"

export const BookContext = createContext<{
	book: Book
	deleteBook: (bookId: number) => Promise<void>
	changeBook: (book: Book) => Promise<void>
} | null>(null)
