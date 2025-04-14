export class BackendClient {
	// The URL of the backend
	private url: string

	// The constructor sets the URL of the backend
	constructor(url: string = "") {
		this.url = url
		localStorage.setItem("backend", url)
	}

	// Check if the backend is accessible
	public async isAccessible(): Promise<boolean> {
		if (!this.url) {
			return false
		}

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
}
