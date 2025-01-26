import { useRef } from "react"
import { Document, Page } from "react-pdf"
import { PageCallback } from "react-pdf/src/shared/types.js"

import { useNavigate } from "@tanstack/react-router"

import styles from "./reader.module.css"

export interface props {
	bookId: number
	bookData: Blob
	initPage: number
	totalPages: number
	toggleDirection: () => void
	canvasMod?: (page: PageCallback, canvas: HTMLCanvasElement) => Promise<void>
	ControlBar: React.FC<{
		currPages: number[]
		handleDeltaPage: (delta: number) => void
	}>
}

export default function HorizontalReader({
	bookId,
	bookData,
	initPage,
	canvasMod,
	ControlBar
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
					onRenderSuccess={
						canvasMod
							? page => {
									if (canvasRef.current) canvasMod(page, canvasRef.current)
								}
							: undefined
					}
				/>
			</Document>
			<ControlBar
				currPages={[initPage]}
				handleDeltaPage={handleDeltaPage}
			/>
		</>
	)
}
