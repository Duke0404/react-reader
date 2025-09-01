import { useContext, useMemo, useRef } from "react"
import { Document, Page } from "react-pdf"
import { PageCallback } from "react-pdf/src/shared/types.js"

import { useNavigate } from "@tanstack/react-router"

import { ReaderSettingsContext } from "../../contexts/readerSettings"
import { db } from "../../db/db"
import useBionicRendering from "../../hooks/useBionicRendering"
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
		readAloud: readAloudConfig,
		translation: translationConfig = { on: false, targetLanguage: "en" },
		scale
	} = useContext(ReaderSettingsContext).settings
	const { applyBionicEffect } = useBionicRendering()

	const canvasMod = useMemo(
		() =>
			bionicConfig.on
				? async (page: PageCallback, canvas: HTMLCanvasElement) =>
						await applyBionicEffect(page, canvas, bionicConfig)
				: undefined,
		[bionicConfig, applyBionicEffect]
	)

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
