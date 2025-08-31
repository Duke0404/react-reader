import { createContext } from "react"
import { Book } from "../interfaces/book"

export const BookContext = createContext<{
	book: Book
	deleteBook: (bookId: number) => Promise<void>
	changeBook: (book: Book) => Promise<void>
} | null>(null)
