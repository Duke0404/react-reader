import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Document, Page } from "react-pdf"
import { PageCallback } from "react-pdf/src/shared/types.js"

import { useNavigate } from "@tanstack/react-router"

import { ReaderSettingsContext } from "../../contexts/readerSettings"
import { db } from "../../db/db"
import useCanvasRendering from "../../hooks/useCanvasRendering"
import useVisiblePages from "../../hooks/useVisiblePages"
import { Book } from "../../interfaces/book"
import ControlBar from "./controlBar/controlBar"
import PagePlaceholder from "./pagePlaceholder/pagePlaceholder"
import ReadAloudBar from "./readAloudBar/readAloudBar"
import TranslationButton from "./translationButton/translationButton"
import styles from "./reader.module.css"

export interface props {
	book: Book
	initPage: number
}

// Number of pages to load before and after the current page
const PAGE_BUFFER = 5

export default function VerticalReader({ book, initPage }: props) {
	const [currPage, setCurrPage] = useState(initPage)
	const [tillPage, setTillPage] = useState(initPage)

	const [visitedPageRange, setVisitedPageRange] = useState(new Set([currPage, 1]))

	const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
		width: 0,
		height: 0
	})

	// get page dimensions of the first page to be used in placehoders
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
		if (pageRefs.current.length === book.totalPages) setAllRefsPopulated(true)
	}, [pageRefs.current.length, book.totalPages])

	const isFirstRender = useRef(true)

	// Scroll to the initial page on first render
	useEffect(() => {
		if (isFirstRender.current && allRefsPopulated) {
			pageRefs.current[initPage - 1]?.scrollIntoView({ behavior: "instant", block: "start" })
			isFirstRender.current = false
		}
	}, [initPage, allRefsPopulated])

	const navigate = useNavigate()

	// Hook to track visible pages and update range
	useVisiblePages(pageRefs, (firstVisible, lastVisible) => {
		currPage !== firstVisible && setCurrPage(firstVisible)
		tillPage !== lastVisible && setTillPage(lastVisible)
		if (!isFirstRender.current) navigate({ to: `/${book.id}/${firstVisible}`, replace: true })
	
		// Set currentPage, lastReadTime, and lastReadPage in the database
		const updates = {
			currentPage: firstVisible,
			lastReadTime: Date.now(),
			lastReadPage: lastVisible > book.lastReadPage ? lastVisible : book.lastReadPage
		}
		db.books.update(book.id, updates).catch(console.error)

		// Calculate the range including buffer
		const newStart = Math.max(1, firstVisible - PAGE_BUFFER)
		const newEnd = Math.min(book.totalPages, lastVisible + PAGE_BUFFER)

		// Update visited pages
		const newVisitedPages: number[] = []
		for (let i = newStart; i <= newEnd; i++) {
			newVisitedPages.push(i)
		}

		setVisitedPageRange(vp => new Set([...vp, ...newVisitedPages]))
	})

	const shouldRenderPage = useCallback(
		(pageNum: number) => visitedPageRange.has(pageNum),
		[visitedPageRange]
	)

	function handleDeltaPage(delta: number) {
		pageRefs.current[currPage + delta - 1]?.scrollIntoView({
			behavior: "smooth",
			block: "start"
		})
	}

	const {
		bionic: bionicConfig,
		colorMode: colorConfig,
		readAloud: readAloudConfig,
		translation: translationConfig = { on: false, targetLanguage: "en" },
		scale
	} = useContext(ReaderSettingsContext).settings

	const { applyCanvasEffects } = useCanvasRendering()

	const canvasMod = useMemo(
		() =>
			bionicConfig.on || colorConfig.on
				? async (page: PageCallback, canvas: HTMLCanvasElement) =>
						await applyCanvasEffects(page, canvas, {
							bionic: bionicConfig,
							colorModes: colorConfig
						})
				: undefined,
		[bionicConfig, colorConfig, applyCanvasEffects]
	)

	// Trigger re-rendering of pages when any visual config changes
	const [renderKey, setRenderKey] = useState(0)
	useEffect(() => {
		setRenderKey(rk => rk + 1)
	}, [bionicConfig, colorConfig])

	// Keyboard navigation for vertical reader (up/down arrows)
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Only handle keyboard events if no input elements are focused
			const activeElement = document.activeElement
			if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
				return
			}

			switch (event.key) {
				case 'ArrowUp':
					event.preventDefault()
					// Go to previous page
					if (currPage > 1) {
						handleDeltaPage(-1)
					}
					break
				case 'ArrowDown':
					event.preventDefault()
					// Go to next page
					if (currPage < book.totalPages) {
						handleDeltaPage(1)
					}
					break
			}
		}

		// Add event listener when component mounts
		document.addEventListener('keydown', handleKeyDown)

		// Clean up event listener when component unmounts
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [currPage, book.totalPages, handleDeltaPage])

	return (
		<>
			<Document
				onLoadError={console.error}
				className={styles["document"]}
				file={book.data}
			>
				{Array.from({ length: book.totalPages }, (_, i) => {
					const pageNum = i + 1
					return shouldRenderPage(pageNum) ? (
						<div className={styles["page-container"]}>
							{(readAloudConfig.on || translationConfig.on) && (
								<div className={styles["page-header"]}>
									{readAloudConfig.on && (
										<ReadAloudBar pageRef={pageRefs.current[i]} />
									)}
									<span className={styles["page-number"]}>{i + 1}</span>
									{translationConfig.on && (
										<TranslationButton pageRef={pageRefs.current[i]} />
									)}
								</div>
							)}
							<Page
								key={`page_${pageNum}_${renderKey}`}
								pageNumber={pageNum}
								className={styles["page"]}
								inputRef={ref => (pageRefs.current[i] = ref)}
								onLoadSuccess={pageNum === 1 ? handleFirstPageLoad : undefined}
								data-page-number={pageNum}
								scale={scale}
								loading={
									<PagePlaceholder
										key={`page_${pageNum}_${renderKey}`}
										width={pageDimensions.width * scale}
										height={pageDimensions.height * scale}
										pageNumber={pageNum}
										ref={ref => (pageRefs.current[i] = ref)}
									/>
								}
								onRenderSuccess={
									canvasMod
										? page => {
												const canvas =
													pageRefs.current[
														page._pageIndex
													]?.querySelector("canvas")
												if (canvas) canvasMod(page, canvas)
											}
										: undefined
								}
							/>
						</div>
					) : (
						firstPageLoaded && (
							<PagePlaceholder
								key={i}
								width={pageDimensions.width * scale}
								height={pageDimensions.height * scale}
								pageNumber={pageNum}
								ref={ref => (pageRefs.current[i] = ref)}
							/>
						)
					)
				})}
			</Document>
			<ControlBar
				currPages={[currPage, tillPage]}
				totalPage={book.totalPages}
				handleDeltaPage={handleDeltaPage}
			/>
		</>
	)
}
