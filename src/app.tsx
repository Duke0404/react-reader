import { useState, useEffect } from "react"

import { RouterProvider, createRouter } from "@tanstack/react-router"

import { BackendClient } from "./clients/backendClient"
import { ServiceWorkerRegistration } from "./components/ServiceWorkerRegistration"
import { BackendContext } from "./contexts/backend"
import { AuthModalContext } from "./contexts/authModal"
import { SyncContext } from "./contexts/sync"
import AuthModal from "./components/authModal/authModal"
import { SyncService } from "./services/syncService"
import { routeTree } from "./routeTree.gen"

// Create a new router instance
const router = createRouter({ 
	routeTree,
	basepath: process.env.NODE_ENV === 'production' ? '/react-reader' : undefined
})

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

export default function App() {
	const [authModalOpen, setAuthModalOpen] = useState(false)
	const [authModalMessage, setAuthModalMessage] = useState("")
	const [syncService, setSyncService] = useState<SyncService | null>(null)
	const [lastSyncTime, setLastSyncTime] = useState<number | null>(null)
	const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle")
	
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
	
	// Initialize sync service when backend changes
	useEffect(() => {
		if (backend.isSet()) {
			setSyncService(new SyncService(backend))
		} else {
			setSyncService(null)
		}
	}, [backend])
	
	// Perform sync
	const performSync = async () => {
		if (!syncService) return
		
		setSyncStatus("syncing")
		const result = await syncService.sync()
		
		if (result.success) {
			setSyncStatus("success")
			setLastSyncTime(Date.now())
			console.log("Sync successful:", result.message)
		} else {
			setSyncStatus("error")
			console.error("Sync failed:", result.message)
		}
		
		// Reset status after 3 seconds
		setTimeout(() => setSyncStatus("idle"), 3000)
	}

	// Check auth validity and sync on mount if backend is configured
	useEffect(() => {
		if (backend.isSet()) {
			backend.isAuthValid().then(isValid => {
				if (isValid === false) {
					// Only show auth modal if backend explicitly returns unauthorized
					setAuthModalMessage("Please login to continue.")
					setAuthModalOpen(true)
				} else if (isValid === true && syncService) {
					// Only sync if authenticated (not in offline mode)
					performSync()
				}
				// If isValid is null, backend is unreachable - allow offline operation
			})
		}
	}, [backend, syncService])

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
				<SyncContext.Provider
					value={{
						syncService,
						lastSyncTime,
						syncStatus
					}}
				>
					<AuthModal />
					<RouterProvider router={router} />
					<ServiceWorkerRegistration />
				</SyncContext.Provider>
			</AuthModalContext.Provider>
		</BackendContext.Provider>
	)
}
