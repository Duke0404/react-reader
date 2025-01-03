import { useState, useRef, useReducer, useEffect } from "react"
import { createLazyFileRoute } from "@tanstack/react-router"
import { Document, Page } from "react-pdf"
import { useLiveQuery } from "dexie-react-hooks"
import { db, Book } from "../db/db"
import { ReadingDirection } from "../types/readingDirection"
import usePageScrollObserver from "../hooks/usePageScrollObserver"
import styles from "./$bookId.$currPage.module.css"

export const Route = createLazyFileRoute("/$bookId/$currPage")({
	component: View
})

function View() {
	const { bookId, currPage } = Route.useParams()
	const [book, setBook] = useState<Book>()
	const [direction] = useState(ReadingDirection.vertical)
	const [bookLoading, changeBookLoading] = useReducer((val: boolean) => !val, true)
	const [numPagesRendered, setNumPagesRendered] = useState(0)

	// Set bookLoading to false when all pages are rendered
	useEffect(() => {
		if (!book) return

		if (numPagesRendered === book.totalPages) changeBookLoading()
	}, [numPagesRendered, book])

	// Fetch book from the indexedDB
	useLiveQuery(async () => {
		const book = await db.books.get(+bookId)
		if (book) setBook(book)
	})

	// Scroll to the current page
	useEffect(() => {
		if (direction === ReadingDirection.horizontal || bookLoading) return

		const pageRef = pageRefs.current[+currPage]
		if (pageRef) pageRef.scrollIntoView({ block: "start" })
	}, [bookLoading, currPage, direction])

	const pageRefs = useRef<(HTMLDivElement | null)[]>([])
	usePageScrollObserver(pageRefs, direction, +bookId, bookLoading)

	return (
		<>
			{book ? (
				<Document
					className={styles["document"]}
					file={book.data}
					onLoadSuccess={changeBookLoading}
				>
					{direction === ReadingDirection.horizontal ? (
						<Page
							pageNumber={+currPage}
							onRenderSuccess={() => setNumPagesRendered(c => c + 1)}
							className={styles["page"]}
						/>
					) : (
						<>
							{+currPage - 2 >= 1 && (
								<Page
									pageNumber={+currPage - 2}
									onRenderSuccess={() => setNumPagesRendered(c => c + 1)}
									className={styles["page"]}
									inputRef={ref => (pageRefs.current[+currPage - 2] = ref)}
								/>
							)}

							{+currPage - 1 >= 1 && (
								<Page
									pageNumber={+currPage - 1}
									onRenderSuccess={() => setNumPagesRendered(c => c + 1)}
									className={styles["page"]}
									inputRef={ref => (pageRefs.current[+currPage - 1] = ref)}
								/>
							)}

							<Page
								pageNumber={+currPage}
								onRenderSuccess={() => setNumPagesRendered(c => c + 1)}
								className={styles["page"]}
								inputRef={ref => (pageRefs.current[+currPage] = ref)}
							/>

							{+currPage - 1 <= book.totalPages - 1 && (
								<Page
									pageNumber={+currPage + 1}
									onRenderSuccess={() => setNumPagesRendered(c => c + 1)}
									className={styles["page"]}
									inputRef={ref => (pageRefs.current[+currPage + 1] = ref)}
								/>
							)}

							{+currPage - 2 <= book.totalPages - 1 && (
								<Page
									pageNumber={+currPage + 2}
									onRenderSuccess={() => setNumPagesRendered(c => c + 1)}
									className={styles["page"]}
									inputRef={ref => (pageRefs.current[+currPage + 2] = ref)}
								/>
							)}
						</>
					)}
				</Document>
			) : (
				<p>Book not found</p>
			)}
		</>
	)
}
