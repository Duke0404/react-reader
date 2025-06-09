import { useEffect, useState } from "react"

import readAloudService from "../services/readAloudService"

export default function useReadAloud() {
	const [isPlaying, setIsPlaying] = useState(readAloudService.isPlaying)
	const [isPaused, setIsPaused] = useState(readAloudService.isPaused)

	useEffect(() => {
		const handlePlayStateChange = (event: CustomEvent) => {
			setIsPlaying(event.detail.isPlaying)
			// Update other states when play state changes
			setIsPaused(readAloudService.isPaused)
		}

		readAloudService.addEventListener(
			"playStateChanged",
			handlePlayStateChange as EventListener
		)

		return () => {
			readAloudService.removeEventListener(
				"playStateChanged",
				handlePlayStateChange as EventListener
			)
		}
	}, [])

	function loadAndReadText(pageRef: HTMLDivElement | null) {
		if (!pageRef) return

		let textContent = ""

		// Get all spans from the page ref
		pageRef.querySelectorAll("span").forEach(span => {
			if (span.textContent) {
				textContent += span.textContent.trim() + " "
			}
		})

		readAloudService.play(textContent.trim())
	}

	function pause() {
		readAloudService.pause()
	}

	function resume() {
		readAloudService.resume()
	}

	function stop() {
		readAloudService.stop()
	}

	return {
		loadAndReadText,
		pause,
		resume,
		stop,
		isPlaying,
		isPaused
	}
}
