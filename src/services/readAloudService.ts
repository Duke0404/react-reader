class ReadAloudService extends EventTarget {
	#isPlaying: boolean
	#currentText: string | null
	#onlineMode: boolean
	#audioElement: HTMLAudioElement
	#isPaused: boolean // Add paused state
	#isLoading: boolean // Add loading state

	constructor() {
		super()
		this.#isPlaying = false
		this.#currentText = null
		this.#onlineMode = false // Default to offline
		this.#audioElement = new Audio()
		this.#isPaused = false
		this.#isLoading = false
	}

	// Private method to update playing state and emit event
	#setIsPlaying(value: boolean) {
		if (this.#isPlaying !== value) {
			this.#isPlaying = value
			this.dispatchEvent(
				new CustomEvent("playStateChanged", {
					detail: { isPlaying: value, isLoading: this.#isLoading }
				})
			)
		}
	}

	// Private method to update loading state and emit event
	#setIsLoading(value: boolean) {
		if (this.#isLoading !== value) {
			this.#isLoading = value
			this.dispatchEvent(
				new CustomEvent("loadingStateChanged", {
					detail: { isLoading: value, isPlaying: this.#isPlaying }
				})
			)
		}
	}

	// Public getters
	get isPlaying(): boolean {
		return this.#isPlaying
	}

	get currentText(): string | null {
		return this.#currentText
	}

	get onlineMode(): boolean {
		return this.#onlineMode
	}

	set onlineMode(value: boolean) {
		this.#onlineMode = value
	}

	get isPaused(): boolean {
		return this.#isPaused
	}

	get isLoading(): boolean {
		return this.#isLoading
	}

	// Play the provided text
	async play(text: string, backendClient?: any) {
		this.stop()

		this.#isPaused = false
		this.#currentText = text

		try {
			if (this.#onlineMode && backendClient) {
				this.#setIsLoading(true)
				await this.#playOnline(text, backendClient)
			} else {
				this.#setIsPlaying(true)
				await this.#playOffline(text)
			}
		} catch (error) {
			console.error("TTS playback error:", error)
			// Fall back to offline mode if online mode fails
			if (this.#onlineMode && backendClient) {
				console.log("Falling back to offline TTS...")
				this.#setIsLoading(false)
				try {
					this.#setIsPlaying(true)
					await this.#playOffline(text)
				} catch (offlineError) {
					console.error("Offline TTS also failed:", offlineError)
				}
			}
		} finally {
			this.#setIsLoading(false)
			this.#setIsPlaying(false)
		}
	}

	async #playOnline(text: string, backendClient: any): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			fetchTTSAudio(text, backendClient)
				.then(audioUrl => {
					// Audio is ready, stop loading and start playing
					this.#setIsLoading(false)
					this.#setIsPlaying(true)
					
					this.#audioElement.src = audioUrl
					this.#audioElement.play()

					this.#audioElement.onended = () => {
						// Clean up the object URL to prevent memory leaks
						URL.revokeObjectURL(audioUrl)
						resolve()
					}

					this.#audioElement.onerror = () => {
						URL.revokeObjectURL(audioUrl)
						reject(new Error("Audio playback failed"))
					}
				})
				.catch(reject)
		})
	}

	#playOffline(text: string): Promise<void> {
		console.log("Playing offline:", text)

		return new Promise((resolve, reject) => {
			const utterance = new SpeechSynthesisUtterance(text)
			window.speechSynthesis.cancel()

			utterance.onend = () => {
				resolve()
			}

			utterance.onerror = () => {
				reject(new Error("Speech synthesis failed"))
			}

			window.speechSynthesis.speak(utterance)
		})
	}

	pause() {
		if (!this.#isPlaying) return // Add guard to prevent pausing when not playing

		if (this.#onlineMode) {
			this.#audioElement.pause()
		} else {
			window.speechSynthesis.pause()
		}

		this.#setIsPlaying(false)
		this.#isPaused = true
	}

	resume() {
		if (!this.#isPaused) return // Add guard to prevent resuming when not paused

		if (this.#onlineMode) {
			this.#audioElement.play()
		} else {
			window.speechSynthesis.resume()
		}

		this.#setIsPlaying(true)
		this.#isPaused = false
	}

	stop() {
		if (this.#onlineMode) {
			this.#audioElement.pause()
			this.#audioElement.currentTime = 0
		} else {
			window.speechSynthesis.cancel()
		}

		this.#setIsLoading(false)
		this.#setIsPlaying(false)
		this.#isPaused = false
		// Keep currentText for playFromStart functionality
	}
}

async function fetchTTSAudio(text: string, backendClient: any): Promise<string> {
	try {
		const audioBuffer = await backendClient.generateTTS(text)
		if (!audioBuffer) {
			throw new Error("Failed to generate TTS audio")
		}
		
		// Convert ArrayBuffer to blob and create object URL
		const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' })
		return URL.createObjectURL(audioBlob)
	} catch (error) {
		console.error("Error fetching TTS audio:", error)
		throw error
	}
}

const readAloudService = new ReadAloudService()
export default readAloudService
