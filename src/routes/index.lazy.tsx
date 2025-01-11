import { createLazyFileRoute } from "@tanstack/react-router"
import Dashboard from "../components/dashboard/dashboard"

export const Route = createLazyFileRoute("/")({
	component: Dashboard
})
