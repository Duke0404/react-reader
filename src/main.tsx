import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

import "./internationalization"
import "./ariaStyles.css"
import "./index.css"

import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { pdfjs } from "react-pdf"

import App from "./app"

// Configure PDF.js worker - use local version for offline support
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
	"pdfjs-dist/build/pdf.worker.min.mjs",
	import.meta.url
).toString()

// Render the app
const rootElement = document.getElementById("root")!
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement)
	root.render(
		<StrictMode>
			<App />
		</StrictMode>
	)
}
