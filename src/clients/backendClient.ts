export class BackendClient {
	// The URL of the backend
	private _url: string

	// The constructor sets the URL of the backend
	constructor(url: string = "") {
		this._url = url
		localStorage.setItem("backend", url)
	}

	get url(): string {
		return this._url
	}

	// Check if the backend URL is unset
	isSet(): boolean {
		return !!this._url
	}

	// Check if the backend is accessible
	async isAccessible(): Promise<boolean> {
		if (!this.url) return false

		try {
			const response = await fetch(`${this.url}/health`, {
				method: "HEAD",
				headers: {
					"Content-Type": "text/plain"
				}
			})
			return response.ok
		} catch (error) {
			console.error("Error checking backend accessibility:", error)
			return false
		}
	}

	async isAuthValid(): Promise<boolean> {
		if (!this.url) return false

		try {
			const response = await fetch(`${this.url}/auth/validate`, {
				method: "GET",
				credentials: "include" as RequestCredentials,
				headers: {
					"Content-Type": "application/json"
				}
			})
			return response.ok
		} catch (error) {
			console.error("Error checking backend accessibility:", error)
			return false
		}
	}

	async register(login: string, password: string): Promise<boolean> {
		if (!this.url) return false

		try {
			const response = await fetch(`${this.url}/auth/register`, {
				method: "POST",
				credentials: "include" as RequestCredentials,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					login,
					password
				})
			})

			return response.ok
		} catch (error) {
			console.error("Error registering user:", error)
			return false
		}
	}

	async login(login: string, password: string): Promise<boolean> {
		if (!this.url) return false

		try {
			const response = await fetch(`${this.url}/auth/login`, {
				method: "POST",
				credentials: "include" as RequestCredentials,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					login,
					password
				})
			})

			return response.ok
		} catch (error) {
			console.error("Error logging in:", error)
			return false
		}
	}
}
