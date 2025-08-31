import { RouterProvider } from "react-aria-components"
import { Outlet, createRootRoute, type ToOptions, useRouter } from "@tanstack/react-router"

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

	return (
		<RouterProvider
			navigate={(to, options) => router.navigate({ to, ...options })}
			useHref={to => router.buildLocation({ to }).href}
		>
			{/* Render the nested routes */}
			<Outlet />
		</RouterProvider>
	)
}
