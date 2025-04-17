import { RouterProvider } from "react-aria-components"
import { useState } from "react"
import { Outlet, createRootRoute, type ToOptions, useRouter } from "@tanstack/react-router"
import { BackendClient } from "../clients/backendClient"
import { BackendContext } from "../contexts/backend"

// Extend RouterConfig for react-aria
declare module "react-aria-components" {
	interface RouterConfig {
		href: ToOptions["to"]
		routerOptions: Record<string, keyof ToOptions>
	}
}

// Define the root route
export const Route = createRootRoute({
	component: RootComponent // Reference a valid React component
})

// Root component definition
function RootComponent() {
	const router = useRouter()

	const backendUrl = localStorage.getItem("backend") || ""
	const [backend, setBackend] = useState(new BackendClient(backendUrl))

	return (
		<BackendContext.Provider value={{ backend, setBackend }}>
			<RouterProvider
				navigate={(to, options) => router.navigate({ to, ...options })}
				useHref={to => router.buildLocation({ to }).href}
			>
				{/* Render the nested routes */}
				<Outlet />
			</RouterProvider>
		</BackendContext.Provider>
	)
}
