import { useState, useEffect } from "react"

import { RouterProvider, createRouter } from "@tanstack/react-router"

import { BackendClient } from "./clients/backendClient"
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration"
import { BackendContext } from "./contexts/backend"
import { AuthModalContext } from "./contexts/authModal"
import AuthModal from "./components/authModal/authModal"
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
	const [authModalOpen, setAuthModalOpen] = useState(false)
	const [authModalMessage, setAuthModalMessage] = useState("")
	
	// Create backend client with auth failure callback
	const [backend, setBackend] = useState(() => {
		const backendUrl = localStorage.getItem("backend") || ""
		return new BackendClient(backendUrl, () => {
			setAuthModalMessage("Your session has expired. Please login again.")
			setAuthModalOpen(true)
		})
	})

	// Update auth failure callback when it changes
	useEffect(() => {
		backend.setAuthFailureCallback(() => {
			setAuthModalMessage("Your session has expired. Please login again.")
			setAuthModalOpen(true)
		})
	}, [backend])

	// Check auth validity on mount if backend is configured
	useEffect(() => {
		if (backend.isSet()) {
			backend.isAuthValid().then(isValid => {
				if (!isValid) {
					setAuthModalMessage("Please login to continue.")
					setAuthModalOpen(true)
				}
			})
		}
	}, [backend])

	return (
		<BackendContext.Provider
			value={{
				backend,
				setBackend
			}}
		>
			<AuthModalContext.Provider
				value={{
					authModalOpen,
					setAuthModalOpen,
					authModalMessage,
					setAuthModalMessage
				}}
			>
				<AuthModal />
				<RouterProvider router={router} />
				<ServiceWorkerRegistration />
			</AuthModalContext.Provider>
		</BackendContext.Provider>
	)
}
