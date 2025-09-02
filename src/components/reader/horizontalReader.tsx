import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { Document, Page } from "react-pdf"
import { PageCallback } from "react-pdf/src/shared/types.js"

import { useNavigate } from "@tanstack/react-router"

import { ReaderSettingsContext } from "../../contexts/readerSettings"
import { db } from "../../db/db"
import useCanvasRendering from "../../hooks/useCanvasRendering"
import { Book } from "../../interfaces/book"
import ControlBar from "./controlBar/controlBar"
import ReadAloudBar from "./readAloudBar/readAloudBar"
import TranslationButton from "./translationButton/translationButton"
import styles from "./reader.module.css"

export interface props {
	book: Book
	initPage: number
}

export default function HorizontalReader({ book, initPage }: props) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const pageRef = useRef<HTMLDivElement>(null)

	const navigate = useNavigate()

	function handleDeltaPage(delta: number) {
		const newPage = initPage + delta
		navigate({ to: `/${book.id}/${newPage}`, replace: true })

		// Update database with new page information
		const updates = {
			currentPage: newPage,
			lastReadTime: Date.now(),
			lastReadPage: newPage > book.lastReadPage ? newPage : book.lastReadPage
		}
		db.books.update(book.id, updates).catch(console.error)
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

	// Keyboard navigation for horizontal reader (left/right arrows)
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Only handle keyboard events if no input elements are focused
			const activeElement = document.activeElement
			if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
				return
			}

			switch (event.key) {
				case 'ArrowLeft':
					event.preventDefault()
					// Go to previous page
					if (initPage > 1) {
						handleDeltaPage(-1)
					}
					break
				case 'ArrowRight':
					event.preventDefault()
					// Go to next page
					if (initPage < book.totalPages) {
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
	}, [initPage, book.totalPages, handleDeltaPage])

	return (
		<>
			<Document
				className={styles["document"]}
				file={book.data}
			>
				<div className={styles["page-container"]}>
					{(readAloudConfig.on || translationConfig.on) && (
						<div className={styles["page-header"]}>
							{readAloudConfig.on && (
								<ReadAloudBar pageRef={pageRef.current} />
							)}
							<span className={styles["page-number"]}>{initPage}</span>
							{translationConfig.on && (
								<TranslationButton pageRef={pageRef.current} />
							)}
						</div>
					)}
					<Page
						key={`page_${initPage}_${renderKey}`}
						pageNumber={initPage}
						className={styles["page"]}
						canvasRef={canvasRef}
						inputRef={pageRef}
						scale={scale}
						onRenderSuccess={
							canvasMod
								? page => {
										if (canvasRef.current) canvasMod(page, canvasRef.current)
									}
								: undefined
						}
					/>
				</div>
			</Document>
			<ControlBar
				currPages={[initPage]}
				totalPage={book.totalPages}
				handleDeltaPage={handleDeltaPage}
			/>
		</>
	)
}
