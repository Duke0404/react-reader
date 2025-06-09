import { useContext, useMemo, useRef } from "react"
import { Document, Page } from "react-pdf"
import { PageCallback } from "react-pdf/src/shared/types.js"

import { useNavigate } from "@tanstack/react-router"

import { BionicConfigContext } from "../../contexts/bionicConfig"
import useBionicRendering from "../../hooks/useBionicRendering"
import ControlBar from "./controlBar/controlBar"
import styles from "./reader.module.css"

export interface props {
	bookId: number
	bookData: Blob
	initPage: number
	totalPages: number
}

export default function HorizontalReader({ bookId, bookData, initPage, totalPages }: props) {
	const canvasRef = useRef<HTMLCanvasElement>(null)

	const navigate = useNavigate()

	function handleDeltaPage(delta: number) {
		navigate({ to: `/${bookId}/${initPage + delta}`, replace: true })
	}

	const { bionicConfig } = useContext(BionicConfigContext)
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
				totalPage={totalPages}
				handleDeltaPage={handleDeltaPage}
			/>
		</>
	)
}
