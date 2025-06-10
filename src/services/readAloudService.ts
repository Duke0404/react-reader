class ReadAloudService extends EventTarget {
	#isPlaying: boolean
	#currentText: string | null
	#onlineMode: boolean
	#audioElement: HTMLAudioElement
	#isPaused: boolean // Add paused state

	constructor() {
		super()
		this.#isPlaying = false
		this.#currentText = null
		this.#onlineMode = false // Default to offline
		this.#audioElement = new Audio()
		this.#isPaused = false
	}

	// Private method to update playing state and emit event
	#setIsPlaying(value: boolean) {
		if (this.#isPlaying !== value) {
			this.#isPlaying = value
			this.dispatchEvent(
				new CustomEvent("playStateChanged", {
					detail: { isPlaying: value }
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

	// Play the provided text
	async play(text: string) {
		this.stop()

		this.#setIsPlaying(true)
		this.#isPaused = false
		this.#currentText = text

		try {
			if (this.#onlineMode) {
				await this.#playOnline()
			} else {
				await this.#playOffline(text)
			}
		} catch (error) {
			console.error("TTS playback error:", error)
		} finally {
			this.#setIsPlaying(false)
		}
	}

	async #playOnline(): Promise<void> {
		return new Promise<void>((resolve, reject) => {
			fetchTTSAudio()
				.then(audioUrl => {
					this.#audioElement.src = audioUrl
					this.#audioElement.play()

					this.#audioElement.onended = () => {
						resolve()
					}

					this.#audioElement.onerror = () => {
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

		this.#setIsPlaying(false)
		this.#isPaused = false
		// Keep currentText for playFromStart functionality
	}
}

async function fetchTTSAudio(): Promise<string> {
	return "path/to/generated/audio.mp3"
}

const readAloudService = new ReadAloudService()
export default readAloudService
