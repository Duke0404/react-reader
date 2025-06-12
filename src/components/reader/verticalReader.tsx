import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { Document, Page } from "react-pdf"
import { PageCallback } from "react-pdf/src/shared/types.js"

import { useNavigate } from "@tanstack/react-router"

import { ReaderSettingsContext } from "../../contexts/readerSettings"
import useCanvasRendering from "../../hooks/useCanvasRendering"
import useVisiblePages from "../../hooks/useVisiblePages"
import ControlBar from "./controlBar/controlBar"
import PagePlaceholder from "./pagePlaceholder/pagePlaceholder"
import ReadAloudBar from "./readAloudBar/readAloudBar"
import styles from "./reader.module.css"

export interface props {
	bookId: number
	bookData: Blob
	initPage: number
	totalPages: number
}

// Number of pages to load before and after the current page
const PAGE_BUFFER = 5

export default function VerticalReader({ bookId, bookData, initPage, totalPages }: props) {
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
		if (pageRefs.current.length === totalPages) setAllRefsPopulated(true)
	}, [pageRefs.current.length, totalPages])

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
		if (!isFirstRender.current) navigate({ to: `/${bookId}/${firstVisible}`, replace: true })

		// Calculate the range including buffer
		const newStart = Math.max(1, firstVisible - PAGE_BUFFER)
		const newEnd = Math.min(totalPages, lastVisible + PAGE_BUFFER)

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

	return (
		<>
			<Document
				className={styles["document"]}
				file={bookData}
			>
				{Array.from({ length: totalPages }, (_, i) => {
					const pageNum = i + 1
					return shouldRenderPage(pageNum) ? (
						<div>
							{readAloudConfig.on && (
								<div className={styles["page-header"]}>
									<ReadAloudBar pageRef={pageRefs.current[i]} />
									<span>{i + 1}</span>
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
				totalPage={totalPages}
				handleDeltaPage={handleDeltaPage}
			/>
		</>
	)
}
