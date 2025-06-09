import { TextContent } from "pdfjs-dist/types/src/display/api"
import { PageCallback } from "react-pdf/src/shared/types.ts"

import { BionicSettings } from "../interfaces/bionicSettings"

export default function useBionicRendering() {
	function renderTextWithBold(
		textContent: TextContent,
		context: CanvasRenderingContext2D,
		scaleX: number,
		scaleY: number,
		height: number,
		bionicConfig: BionicSettings
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
				if (i % bionicConfig.highlightJump !== 0) {
					context.font = `300 ${fontSize}px ${font}`
					context.globalAlpha = bionicConfig.lowlightOpacity
					context.fillText(word, currentX, offsetY)
					context.globalAlpha = 1
					currentX += context.measureText(word).width + context.measureText(" ").width
					return
				}

				const threshold = Math.round((bionicConfig.highlightSize * word.length) / 6)

				context.font = `700 ${fontSize}px ${font}`

				for (let i = 0; i < bionicConfig.highlightMultiplier; i++) {
					// Layer text for extra bold effect
					context.fillText(word.slice(0, threshold), currentX, offsetY)
				}

				context.font = `300 ${fontSize}px ${font}`
				const boldWidth =
					context.measureText(word.slice(0, threshold)).width + threshold / 2
				context.globalAlpha = bionicConfig.lowlightOpacity
				context.fillText(word.slice(threshold), currentX + boldWidth, offsetY)
				context.globalAlpha = 1

				currentX += context.measureText(word).width + context.measureText("  ").width
			})
		})
	}

	async function applyBionicEffect(
		page: PageCallback,
		canvas: HTMLCanvasElement,
		bionicConfig: BionicSettings
	) {
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
		renderTextWithBold(textContent, context, scaleX, scaleY, page.height, bionicConfig)
	}

	return { applyBionicEffect }
}
