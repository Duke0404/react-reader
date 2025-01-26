import { useLiveQuery } from "dexie-react-hooks"
import { TextContent } from "pdfjs-dist/types/src/display/api"
import { useReducer, useState } from "react"
import { PageCallback } from "react-pdf/src/shared/types.ts"

import { useNavigate } from "@tanstack/react-router"

import { Book, db } from "../../db/db"
import BionicSettings from "../../types/bionicSettings"
import { ReadingDirection } from "../../types/readingDirection"
import ActionBar from "./actionBar"
import ControlBar from "./controlBar"
import HorizontalReader from "./horizontalReader"
import styles from "./reader.module.css"
import SettingsPane from "./settingsPane"
import VerticalReader from "./verticalReader"

export interface props {
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

	const [direction, toggleDirection] = useReducer(
		d =>
			d === ReadingDirection.vertical
				? ReadingDirection.horizontal
				: ReadingDirection.vertical,
		ReadingDirection.vertical
	)

	const [bionicSettings, setBionicSettings] = useState<BionicSettings>({
		on: false,
		highlightSize: 3,
		highlightJump: 1,
		highlightMultiplier: 4,
		lowlightOpacity: 0.6
	})

	const keyFromBionicSettings = (settings: BionicSettings) =>
		`bionic-${settings.on}-${settings.highlightSize}-${settings.highlightJump}-${settings.highlightMultiplier}-${settings.lowlightOpacity}`

	function renderTextWithBold(
		textContent: TextContent,
		context: CanvasRenderingContext2D,
		scaleX: number,
		scaleY: number,
		height: number
	) {
		textContent.items.forEach(item => {
			if (!("str" in item && "fontName" in item && "transform" in item)) return

			const text = item.str
			const font = item.fontName
			const fontSize = Math.abs(item.transform[3]) * scaleY

			// Use raw transform values - they're already scaled
			const offsetX = item.transform[4] * scaleX
			// Adjust Y calculation to match PDF coordinates more precisely
			const offsetY = (height - item.transform[5]) * scaleY

			const words = text.split(" ")
			let currentX = offsetX

			words.forEach((word, i) => {
				if (i % bionicSettings.highlightJump !== 0) {
					context.font = `300 ${fontSize}px ${font}`
					context.globalAlpha = bionicSettings.lowlightOpacity
					context.fillText(word, currentX, offsetY)
					context.globalAlpha = 1
					currentX += context.measureText(word).width + context.measureText(" ").width
					return
				}

				const threshold = Math.round((bionicSettings.highlightSize * word.length) / 6)

				context.font = `700 ${fontSize}px ${font}`

				for (let i = 0; i < bionicSettings.highlightMultiplier; i++) {
					// Layer text for extra bold effect
					context.fillText(word.slice(0, threshold), currentX, offsetY)
				}

				context.font = `300 ${fontSize}px ${font}`
				const boldWidth = context.measureText(word.slice(0, threshold)).width + threshold / 2
				context.globalAlpha = bionicSettings.lowlightOpacity
				context.fillText(word.slice(threshold), currentX + boldWidth, offsetY)
				context.globalAlpha = 1

				currentX += context.measureText(word).width + context.measureText("  ").width
			})
		})
	}

	async function bionic(page: PageCallback, canvas: HTMLCanvasElement) {
		const context = canvas.getContext("2d")

		const scaleX = canvas.width / page.width
		const scaleY = canvas.height / page.height

		if (!context) return

		// Backup the original fillText method
		const originalFillText = context.fillText

		// Override fillText to skip rendering text
		context.fillText = function () {
			// Do nothing to skip original text rendering
		}

		const viewport = page.getViewport({ scale: scaleX })

		// Adjust the canvas size to match the viewport
		canvas.width = viewport.width
		canvas.height = viewport.height

		// Render the page background (images, lines, etc.)
		await page.render({ canvasContext: context, viewport }).promise

		// Restore the original fillText method
		context.fillText = originalFillText

		// Retrieve text content from PDF page
		const textContent = await page.getTextContent()

		// Render the text with the bold modifications
		renderTextWithBold(textContent, context, scaleX, scaleY, page.height)
	}

	const ControlWrapper = ({
		currPages,
		handleDeltaPage
	}: {
		currPages: number[]
		handleDeltaPage: (delta: number) => void
	}) => (
		<ControlBar
			currPages={currPages}
			totalPage={book?.totalPages || 0}
			direction={direction}
			toggleDirection={toggleDirection}
			handleDeltaPage={handleDeltaPage}
		/>
	)

	const [settingsOpen, toggleSettingsOpen] = useReducer(so => !so, false)

	return (
		<>
			{book ? (
				<div className={styles["reader-wrapper"]}>
					{settingsOpen && (
						<SettingsPane
							bionicSettings={bionicSettings}
							setBionicSettings={setBionicSettings}
						/>
					)}
					<div className={styles["document-wrapper"]}>
						{direction === ReadingDirection.horizontal ? (
							<HorizontalReader
								bookId={bookId}
								bookData={book.data}
								initPage={initPage}
								totalPages={book.totalPages}
								key={keyFromBionicSettings(bionicSettings)}
								toggleDirection={toggleDirection}
								canvasMod={bionicSettings.on ? bionic : undefined}
								ControlBar={ControlWrapper}
							/>
						) : (
							<VerticalReader
								bookId={bookId}
								bookData={book.data}
								initPage={initPage}
								totalPages={book.totalPages}
								key={keyFromBionicSettings(bionicSettings)}
								canvasMod={bionicSettings.on ? bionic : undefined}
								ControlBar={ControlWrapper}
							/>
						)}
					</div>
					<ActionBar toggleSettings={toggleSettingsOpen} />
				</div>
			) : (
				<p>Book not found</p>
			)}
		</>
	)
}
