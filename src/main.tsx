import "react-pdf/dist/Page/AnnotationLayer.css"
import "react-pdf/dist/Page/TextLayer.css"

import "./ariaStyles.css"
import "./index.css"

import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { pdfjs } from "react-pdf"

import App from "./app"

// Configure PDF.js worker with smart interception
const basePath = process.env.NODE_ENV === 'production' ? '/react-reader' : ''
const workerUrl = `${basePath}/pdf.worker.mjs`
let currentWorkerSrc = workerUrl

// Set initial worker
pdfjs.GlobalWorkerOptions.workerSrc = workerUrl

// Intercept attempts to change the worker and redirect them
Object.defineProperty(pdfjs.GlobalWorkerOptions, 'workerSrc', {
	get() {
		return currentWorkerSrc
	},
	set(value) {
		// If React-PDF tries to set a problematic worker, redirect to our working one
		if (!value || value.includes('fake') || value === 'pdf.worker.mjs') {
			console.log('Intercepted problematic worker assignment:', value, '-> redirecting to:', workerUrl)
			currentWorkerSrc = workerUrl
		} else {
			console.log('Allowing worker assignment:', value)
			currentWorkerSrc = value
		}
	},
	configurable: true
})

console.log('PDF.js worker interceptor configured for:', workerUrl)

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
