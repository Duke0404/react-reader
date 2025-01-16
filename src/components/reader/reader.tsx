import { useLiveQuery } from "dexie-react-hooks"
import { TextContent } from "pdfjs-dist/types/src/display/api"
import { useReducer, useState } from "react"
import { PageCallback } from "react-pdf/src/shared/types.ts"

import { useNavigate } from "@tanstack/react-router"

import { Book, db } from "../../db/db"
import { ReadingDirection } from "../../types/readingDirection"
import HorizontalReader from "./horizontalReader"
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

	const [bionicMode, setBionicMode] = useState(false)

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

			words.forEach(word => {
				if (word.length > 2) {
					context.font = `bold ${fontSize}px ${font}`
					context.fillText(word.slice(0, 2), currentX, offsetY)

					context.font = `${fontSize}px ${font}`
					const boldWidth = context.measureText(word.slice(0, 2)).width
					context.fillText(word.slice(2), currentX + boldWidth, offsetY)

					currentX += context.measureText(word).width + context.measureText(" ").width
				} else {
					context.font = `${fontSize}px ${font}`
					context.fillText(word, currentX, offsetY)
					currentX += context.measureText(word).width + context.measureText(" ").width
				}
			})
		})
	}

	async function bionic(page: PageCallback, canvas: HTMLCanvasElement) {
		const context = canvas.getContext("2d")

		const scaleX = canvas.width / page.width
		const scaleY = canvas.height / page.height

		if (!context) return

		// Retrieve text content from PDF page
		const textContent = await page.getTextContent()

		// Render the text with the bold modifications
		renderTextWithBold(textContent, context, scaleX, scaleY, page.height)
	}

	return (
		<>
			{book ? (
				<>
					{direction === ReadingDirection.horizontal ? (
						<HorizontalReader
							bookId={bookId}
							initPage={initPage}
							totalPages={book.totalPages}
							bookData={book.data}
							toggleDirection={toggleDirection}
						/>
					) : (
						<VerticalReader
							bookId={bookId}
							initPage={initPage}
							totalPages={book.totalPages}
							bookData={book.data}
							// handlePageRender={handlePageRender}
							toggleDirection={toggleDirection}
						/>
					)}
				</>
			) : (
				<p>Book not found</p>
			)}
		</>
	)
}
