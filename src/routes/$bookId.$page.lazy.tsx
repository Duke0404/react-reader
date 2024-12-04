import { useState, useRef, useReducer } from "react"
import { createLazyFileRoute } from "@tanstack/react-router"
import { Document, Page } from "react-pdf"
import { useLiveQuery } from "dexie-react-hooks"
import { db, Book } from "../db/db"
import { ReadingDirection } from "../types/readingDirection"
import usePageScrollObserver from "../hooks/usePageScrollObserver"
import styles from "./$bookId.$page.module.css"

export const Route = createLazyFileRoute("/$bookId/$page")({
	component: View
})

function View() {
	const { bookId, page } = Route.useParams()
	const [book, setBook] = useState<Book>()
	const [direction] = useState(ReadingDirection.vertical)
	const [bookLoading, changeBookLoading] = useReducer((val: boolean) => !val, true)

	// Fetch book from the indexedDB
	useLiveQuery(async () => {
		const book = await db.books.get(+bookId)
		if (book) setBook(book)
	})

	const pageRefs = useRef<(HTMLDivElement | null)[]>([])

	usePageScrollObserver(pageRefs, direction, +bookId, bookLoading)

	return (
		<>
			{book ? (
				<Document
					className={styles.document}
					file={book.data}
					onLoadSuccess={changeBookLoading}
				>
					{direction === ReadingDirection.horizontal ? (
						<Page pageNumber={+page} />
					) : (
						[...Array(book.totalPages)].map((_, i) => (
							<Page
								key={i}
								pageNumber={i + 1}
								inputRef={ref => {
									pageRefs.current[i] = ref
								}}
							/>
						))
					)}
				</Document>
			) : (
				<p>Book not found</p>
			)}
		</>
	)
}
