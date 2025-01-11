import { useState, useRef, useCallback, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Document, Page } from "react-pdf"
import { useLiveQuery } from "dexie-react-hooks"
import { db, Book } from "../../db/db"
import { ReadingDirection } from "../../types/readingDirection"
import useVisiblePages from "../../hooks/useVisiblePages"
import styles from "./reader.module.css"
import PagePlaceholder from "./pagePlaceholder"
import ActionBar from "./actionBar"

// Number of pages to load before and after the current page
const PAGE_BUFFER = 5

interface props {
	bookId: number
	initPage: number
}

export default function Reader({ bookId, initPage }: props) {
	const navigate = useNavigate()

	const [book, setBook] = useState<Book>()
	useLiveQuery(async () => {
		const book = await db.books.get(+bookId)
		if (book) setBook(book)
		else navigate({ to: "/404" })
	})

	const [currPage, setCurrPage] = useState(initPage)
	const [tillPage, setTillPage] = useState(initPage)
	const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
		width: 0,
		height: 0
	})

	const [visitedPageRange, setVisitedPageRange] = useState(new Set([currPage, 1]))

	// get page dimensions
	const [firstPageLoaded, setFirstPageLoaded] = useState(false)
	const handleFirstPageLoad = useCallback(
		({ width, height }: { width: number; height: number }) => {
			setPageDimensions({ width, height })
			setFirstPageLoaded(true)
		},
		[]
	)

	// References to each page
	const pageRefs = useRef<(HTMLDivElement | null)[]>([])

	// Check if all refs are populated
	const [allRefsPopulated, setAllRefsPopulated] = useState(false)
	useEffect(() => {
		if (book && pageRefs.current.length === book.totalPages) setAllRefsPopulated(true)
	}, [book, pageRefs.current.length])

	const isFirstRender = useRef(true)

	// Scroll to the initial page on first render
	useEffect(() => {
		if (isFirstRender.current && allRefsPopulated) {
			pageRefs.current[initPage - 1]?.scrollIntoView({ behavior: "instant", block: "start" })
			isFirstRender.current = false
		}
	}, [initPage, allRefsPopulated])

	// Custom hook to track visible pages and update range
	useVisiblePages(pageRefs, (firstVisible, lastVisible) => {
		currPage !== firstVisible && setCurrPage(firstVisible)
		tillPage !== lastVisible && setTillPage(lastVisible)
		if (!isFirstRender.current) navigate({ to: `/${bookId}/${firstVisible}`, replace: true })

		// Calculate the range including buffer
		const newStart = Math.max(1, firstVisible - PAGE_BUFFER)
		const newEnd = book
			? Math.min(book.totalPages, lastVisible + PAGE_BUFFER)
			: lastVisible + PAGE_BUFFER

		// Update visited pages
		const newVisitedPages: number[] = []
		for (let i = newStart; i <= newEnd; i++) {
			newVisitedPages.push(i)
		}

		setVisitedPageRange(vp => {
			const t = new Set([...vp, ...newVisitedPages])
			return t
		})
	})

	const shouldRenderPage = useCallback(
		(pageNum: number) => visitedPageRange.has(pageNum),
		[visitedPageRange]
	)

	const [direction, setDirection] = useState(ReadingDirection.vertical)
	// Toggle reading direction preserving the current page
	function toggleDirection() {
		if (direction === ReadingDirection.vertical) {
			setDirection(ReadingDirection.horizontal)
		} else {
			setAllRefsPopulated(false)
			isFirstRender.current = true
			// initPage = currPage
			setDirection(ReadingDirection.vertical)
		}
	}

	// Handle page navigation
	function handleDeltaPage(delta: number) {
		if (!book || currPage >= book.totalPages) return

		const location = currPage + delta

		if (location < 1 || location > book.totalPages) return

		if (direction === ReadingDirection.vertical)
			pageRefs.current[location - 1]?.scrollIntoView({
				behavior: "smooth",
				block: "start"
			})
		else {
			setCurrPage(location)
			navigate({ to: `/${bookId}/${location}`, replace: true})
		}
	}

	return (
		<>
			{book ? (
				<>
					<Document
						className={styles["document"]}
						file={book.data}
					>
						{direction === ReadingDirection.horizontal ? (
							<Page
								pageNumber={currPage}
								className={styles["page"]}
							/>
						) : (
							<>
								{Array.from({ length: book.totalPages }, (_, i) => {
									const pageNum = i + 1
									return shouldRenderPage(pageNum) ? (
										<Page
											key={i}
											pageNumber={pageNum}
											className={styles["page"]}
											inputRef={ref => (pageRefs.current[i] = ref)}
											onLoadSuccess={
												pageNum === 1 ? handleFirstPageLoad : undefined
											}
											data-page-number={pageNum}
											loading={
												<PagePlaceholder
													key={i}
													width={pageDimensions.width}
													height={pageDimensions.height}
													pageNumber={pageNum}
													ref={ref => (pageRefs.current[i] = ref)}
												/>
											}
										/>
									) : (
										firstPageLoaded && (
											<PagePlaceholder
												key={i}
												width={pageDimensions.width}
												height={pageDimensions.height}
												pageNumber={pageNum}
												ref={ref => (pageRefs.current[i] = ref)}
											/>
										)
									)
								})}
							</>
						)}
					</Document>
					<ActionBar
						currPages={[currPage, tillPage]}
						totalPage={book.totalPages}
						direction={direction}
						toggleDirection={toggleDirection}
						handleDeltaPage={handleDeltaPage}
					/>
				</>
			) : (
				<p>Book not found</p>
			)}
		</>
	)
}
