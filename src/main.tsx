import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import "./internationalization"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { routeTree } from "./routeTree.gen"
import { pdfjs } from "react-pdf"
import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"
import "./index.css"
import { BackendContext } from "./contexts/backend"

// Create a new router instance
const router = createRouter({ routeTree })

// Register the router instance for type safety
declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router
	}
}

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url
).toString()

// Render the app
const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
	const backend = localStorage.getItem("backend") || ""

	const root = ReactDOM.createRoot(rootElement)
	root.render(
		<StrictMode>
			<BackendContext.Provider value={backend}>
				<RouterProvider router={router} />
			</BackendContext.Provider>
		</StrictMode>
	)
}
