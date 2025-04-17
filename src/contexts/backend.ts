import { createContext, Dispatch, SetStateAction } from "react"
import { BackendClient } from "../clients/backendClient"

export const BackendContext = createContext<{
	backend: BackendClient
	setBackend: Dispatch<SetStateAction<BackendClient>>
}>({
	backend: new BackendClient(),
	setBackend: () => {
		throw new Error("BackendContext is not provided")
	}
})
