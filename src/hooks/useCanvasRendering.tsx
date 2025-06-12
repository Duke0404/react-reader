import { TextContent } from "pdfjs-dist/types/src/display/api"
import { PageCallback } from "react-pdf/src/shared/types.ts"

import { colorModes } from "../data/colorModes"
import { BionicSettings } from "../interfaces/bionicSettings"
import { ColorModeSettings } from "../interfaces/colorModeSettings"

export interface CanvasRenderingOptions {
	bionic: BionicSettings
	colorModes: ColorModeSettings
}

export default function useCanvasRendering() {
	function renderTextWithEffects(
		textContent: TextContent,
		context: CanvasRenderingContext2D,
		scaleX: number,
		scaleY: number,
		height: number,
		options: CanvasRenderingOptions
	) {
		const { bionic: bionicConfig, colorModes: colorConfig } = options

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
				// Determine if this word should be highlighted (bionic mode)
				const shouldHighlight = bionicConfig.on && i % bionicConfig.highlightJump === 0

				const { text: fontColor } = colorModes[colorConfig.mode]

				if (!shouldHighlight) {
					// Regular word rendering
					context.font = `300 ${fontSize}px ${font}`
					context.fillStyle = colorConfig.on && fontColor ? fontColor : context.fillStyle
					context.globalAlpha = bionicConfig.on ? bionicConfig.lowlightOpacity : 1
					context.fillText(word, currentX, offsetY)
					context.globalAlpha = 1
					currentX += context.measureText(word).width + context.measureText(" ").width
					return
				}

				// Bionic highlighting
				const threshold = Math.round((bionicConfig.highlightSize * word.length) / 6)

				// Bold part
				context.font = `700 ${fontSize}px ${font}`
				context.fillStyle = colorConfig.on && fontColor ? fontColor : context.fillStyle

				for (let i = 0; i < bionicConfig.highlightMultiplier; i++) {
					// Layer text for extra bold effect
					context.fillText(word.slice(0, threshold), currentX, offsetY)
				}

				// Regular part
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

	function applyBackgroundColor(
		context: CanvasRenderingContext2D,
		width: number,
		height: number,
		backgroundColor: string
	) {
		context.save()
		context.fillStyle = backgroundColor
		context.fillRect(0, 0, width, height)
		context.restore()
	}

	async function applyCanvasEffects(
    page: PageCallback,
    canvas: HTMLCanvasElement,
    options: CanvasRenderingOptions
) {
    const context = canvas.getContext("2d")
    if (!context) return

    const scaleX = canvas.width / page.width
    const scaleY = canvas.height / page.height

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

    // Render the page background (images, lines, etc.) FIRST
    await page.render({ canvasContext: context, viewport }).promise

    // Apply background color AFTER PDF rendering if enabled
    if (options.colorModes.on) {
        const { background: backgroundColor } = colorModes[options.colorModes.mode]
        applyBackgroundColor(context, canvas.width, canvas.height, backgroundColor)
    }

    // Restore the original fillText method
    context.fillText = originalFillText

    // Retrieve text content from PDF page
    const textContent = await page.getTextContent()

    // Render the text with all effects
    renderTextWithEffects(textContent, context, scaleX, scaleY, page.height, options)
}

	return { applyCanvasEffects }
}
