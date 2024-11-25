import { useState, useEffect, useRef } from "react"
import { createLazyFileRoute } from "@tanstack/react-router"
import { Document, Page } from "react-pdf"
import { useLiveQuery } from "dexie-react-hooks"
import { getDocument } from "pdfjs-dist"
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
	const [direction, setDirection] = useState(ReadingDirection.vertical)
	const [pages, setPages] = useState(1)

	// Fetch book from the indexedDB
	useLiveQuery(async () => {
		const book = await db.books.get(+bookId)
		if (book) setBook(book)
	})

	const pageRefs = useRef<(HTMLDivElement | null)[]>([])

	// Get the number of pages in the PDF
	useEffect(() => {
		if (direction === ReadingDirection.vertical && book) {
			(async (bookBlob: Blob) => {
				try {
					const arrayBuffer = await bookBlob.arrayBuffer();
					const pdf = await getDocument(arrayBuffer).promise;
					setPages(pdf.numPages);
				} catch (error) {
					console.error("Error loading PDF:", error);
				}
			})(book.data);
		} else if (direction === ReadingDirection.horizontal) {
			setPages(1);
		}
	}, [book, direction]);

	usePageScrollObserver(pageRefs, direction, +bookId)

	return (
		<>
			<Document
				className={styles.document}
				file={book?.data}
			>
				{direction === ReadingDirection.horizontal ? (
					<Page pageNumber={+page} />
				) : (
					[...Array(pages)].map((_, i) => (
						<Page
							key={i}
							pageNumber={i + 1}
							inputRef={(ref) => {
								// if (pageRefs.current.length <= i && ref) {
								// 	pageRefs.current = [...pageRefs.current as HTMLDivElement[], ref]
								// }
								if (ref)
									pageRefs.current[i] = ref
							}}
						/>
					))
				)}
			</Document>
		</>
	)
}
