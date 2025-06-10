import { useContext, useMemo, useRef } from "react"
import { Document, Page } from "react-pdf"
import { PageCallback } from "react-pdf/src/shared/types.js"

import { useNavigate } from "@tanstack/react-router"

import { BionicConfigContext } from "../../contexts/bionicConfig"
import { ReadAloudConfigContext } from "../../contexts/readAloudConfig"
import useBionicRendering from "../../hooks/useBionicRendering"
import ControlBar from "./controlBar/controlBar"
import ReadAloudBar from "./readAloudBar/readAloudBar"
import styles from "./reader.module.css"

export interface props {
	bookId: number
	bookData: Blob
	initPage: number
	totalPages: number
}

export default function HorizontalReader({ bookId, bookData, initPage, totalPages }: props) {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const pageRef = useRef<HTMLDivElement>(null)

	const navigate = useNavigate()

	function handleDeltaPage(delta: number) {
		navigate({ to: `/${bookId}/${initPage + delta}`, replace: true })
	}

	const { bionicConfig } = useContext(BionicConfigContext)
	const { readAloudConfig } = useContext(ReadAloudConfigContext)
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
				<div>
					{readAloudConfig.on && (
						<div className={styles["page-header"]}>
							<ReadAloudBar pageRef={pageRef.current} />
							<span>{initPage}</span>
						</div>
					)}
					<Page
						pageNumber={initPage}
						className={styles["page"]}
						canvasRef={canvasRef}
						inputRef={pageRef}
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
				totalPage={totalPages}
				handleDeltaPage={handleDeltaPage}
			/>
		</>
	)
}
