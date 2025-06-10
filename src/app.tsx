import { useState } from "react"

import { RouterProvider, createRouter } from "@tanstack/react-router"

import { BackendClient } from "./clients/backendClient"
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration"
import { BackendContext } from "./contexts/backend"
import { routeTree } from "./routeTree.gen"

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

export default function App() {
	const [backend, setBackend] = useState(new BackendClient(localStorage.getItem("backend") || ""))

	return (
		<BackendContext.Provider
			value={{
				backend,
				setBackend
			}}
		>
			<RouterProvider router={router} />
			<ServiceWorkerRegistration />
		</BackendContext.Provider>
	)
}
