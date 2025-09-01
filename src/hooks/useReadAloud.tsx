import { useContext, useEffect, useState } from "react"

import { BackendContext } from "../contexts/backend"
import { ReaderSettingsContext } from "../contexts/readerSettings"
import readAloudService from "../services/readAloudService"

export default function useReadAloud() {
	const [isPlaying, setIsPlaying] = useState(readAloudService.isPlaying)
	const [isPaused, setIsPaused] = useState(readAloudService.isPaused)
	const [isLoading, setIsLoading] = useState(readAloudService.isLoading)
	const { backend } = useContext(BackendContext)
	const { settings } = useContext(ReaderSettingsContext)

	// Update online mode based on backend availability and settings
	useEffect(() => {
		const updateOnlineMode = async () => {
			if (settings.readAloud.localAlways) {
				readAloudService.onlineMode = false
			} else {
				const isBackendAccessible = await backend.isAccessible()
				const isAuthValid = await backend.isAuthValid()
				readAloudService.onlineMode = isBackendAccessible && (isAuthValid === true)
			}
		}

		updateOnlineMode()
	}, [backend, settings.readAloud.localAlways])

	useEffect(() => {
		const handlePlayStateChange = (event: CustomEvent) => {
			setIsPlaying(event.detail.isPlaying)
			setIsLoading(event.detail.isLoading)
			// Update other states when play state changes
			setIsPaused(readAloudService.isPaused)
		}

		const handleLoadingStateChange = (event: CustomEvent) => {
			setIsLoading(event.detail.isLoading)
			setIsPlaying(event.detail.isPlaying)
		}

		readAloudService.addEventListener(
			"playStateChanged",
			handlePlayStateChange as EventListener
		)

		readAloudService.addEventListener(
			"loadingStateChanged",
			handleLoadingStateChange as EventListener
		)

		return () => {
			readAloudService.removeEventListener(
				"playStateChanged",
				handlePlayStateChange as EventListener
			)
			readAloudService.removeEventListener(
				"loadingStateChanged",
				handleLoadingStateChange as EventListener
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

		readAloudService.play(textContent.trim(), backend)
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
		isPaused,
		isLoading
	}
}
