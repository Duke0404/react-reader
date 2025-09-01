export class BackendClient {
	// The URL of the backend
	private _url: string
	// Callback for when authentication fails
	private onAuthFailure?: () => void

	// The constructor sets the URL of the backend
	constructor(url: string = "", onAuthFailure?: () => void) {
		this._url = url
		this.onAuthFailure = onAuthFailure
		// Only save to localStorage if URL is provided
		if (url) {
			localStorage.setItem("backend", url)
		}
	}

	get url(): string {
		return this._url
	}

	get authFailureCallback(): (() => void) | undefined {
		return this.onAuthFailure
	}

	// Set the auth failure callback
	setAuthFailureCallback(callback: () => void) {
		this.onAuthFailure = callback
	}

	// Check if the backend URL is unset
	isSet(): boolean {
		return !!this._url
	}

	// Check if the backend is accessible
	async isAccessible(): Promise<boolean> {
		if (!this.url) return false

		try {
			// Add timeout to reduce console noise
			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 3000)
			
			const response = await fetch(`${this.url}/health`, {
				method: "HEAD",
				headers: {
					"Content-Type": "text/plain"
				},
				signal: controller.signal
			})
			
			clearTimeout(timeoutId)
			return response.ok
		} catch (error) {
			// Backend unreachable - this is expected in offline mode, don't log as error
			return false
		}
	}

	async isAuthValid(): Promise<boolean | null> {
		if (!this.url) return null // null means backend not configured or unreachable

		try {
			const response = await fetch(`${this.url}/auth/validate`, {
				method: "GET",
				credentials: "include" as RequestCredentials,
				headers: {
					"Content-Type": "application/json"
				}
			})
			return response.ok // true if authenticated, false if 401/403
		} catch (error) {
			// Network error - backend unreachable, return null for offline mode
			console.log("Backend unreachable, operating in offline mode")
			return null
		}
	}

	async register(username: string, password: string): Promise<boolean> {
		if (!this.url) return false

		try {
			const response = await fetch(`${this.url}/auth/register`, {
				method: "POST",
				credentials: "include" as RequestCredentials,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					username,
					password
				})
			})

			return response.ok
		} catch (error) {
			console.error("Error registering user:", error)
			return false
		}
	}

	async login(username: string, password: string): Promise<boolean> {
		if (!this.url) return false

		try {
			const response = await fetch(`${this.url}/auth/login`, {
				method: "POST",
				credentials: "include" as RequestCredentials,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					username,
					password
				})
			})

			return response.ok
		} catch (error) {
			console.error("Error logging in:", error)
			return false
		}
	}

	// Helper method to handle 401 errors
	private async handleResponse(response: Response): Promise<Response> {
		if (response.status === 401 && this.onAuthFailure) {
			this.onAuthFailure()
		}
		return response
	}

	// Text-to-speech API call
	async generateTTS(text: string, voice?: string): Promise<ArrayBuffer | null> {
		if (!this.url) return null

		try {
			const response = await fetch(`${this.url}/readAloud`, {
				method: "POST",
				credentials: "include" as RequestCredentials,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					text,
					voice: voice || "en_US-lessac-high"
				})
			})

			const handledResponse = await this.handleResponse(response)
			if (!handledResponse.ok) return null

			return await handledResponse.arrayBuffer()
		} catch (error) {
			console.error("Error generating TTS:", error)
			return null
		}
	}

	// Translation API call
	async translate(text: string, targetLanguage: string): Promise<string | null> {
		if (!this.url) return null

		try {
			const response = await fetch(`${this.url}/translate`, {
				method: "POST",
				credentials: "include" as RequestCredentials,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					text,
					target: targetLanguage
				})
			})

			const handledResponse = await this.handleResponse(response)
			if (!handledResponse.ok) return null

			const data = await handledResponse.json()
			return data.translatedText
		} catch (error) {
			console.error("Error translating text:", error)
			return null
		}
	}

	// Get available translation languages
	async getLanguages(): Promise<Array<{ code: string; name: string }> | null> {
		if (!this.url) return null

		try {
			const response = await fetch(`${this.url}/translate/languages`, {
				method: "GET",
				credentials: "include" as RequestCredentials,
				headers: {
					"Content-Type": "application/json"
				}
			})

			const handledResponse = await this.handleResponse(response)
			if (!handledResponse.ok) return null

			return await handledResponse.json()
		} catch (error) {
			console.error("Error fetching languages:", error)
			return null
		}
	}
}
