import { useContext } from "react"
import { ReaderContext } from "./reader"

export const useReader = () => {
	const context = useContext(ReaderContext)
	if (!context) {
		throw new Error("useReader must be used within a ReaderProvider")
	}
	return context
}
