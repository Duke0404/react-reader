import { useRef } from "react"
import { Document, Page } from "react-pdf"

import { useNavigate } from "@tanstack/react-router"

import { ReadingDirection } from "../../types/readingDirection"
import ActionBar from "./actionBar"
import styles from "./reader.module.css"

export interface props {
	bookId: number
	initPage: number
	totalPages: number
	bookData: Blob
	toggleDirection: () => void
}

export default function HorizontalReader({
	bookId,
	initPage,
	totalPages,
	bookData,
	toggleDirection
}: props) {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const navigate = useNavigate()

	function handleDeltaPage(delta: number) {
		navigate({ to: `/${bookId}/${initPage + delta}`, replace: true })
	}

	return (
		<>
			<Document
				className={styles["document"]}
				file={bookData}
			>
				<Page
					pageNumber={initPage}
					className={styles["page"]}
					canvasRef={canvasRef}
				/>
			</Document>
			<ActionBar
				currPages={[initPage]}
				totalPage={totalPages}
				direction={ReadingDirection.horizontal}
				toggleDirection={toggleDirection}
				handleDeltaPage={handleDeltaPage}
			/>
		</>
	)
}
