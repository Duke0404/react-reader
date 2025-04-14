import { createContext, Dispatch, SetStateAction } from "react"
import { BackendClient } from "../clients/backendClient"

export const BackendContext = createContext<{
	backend: BackendClient
	setBackend: Dispatch<SetStateAction<BackendClient>>
} | null>(null)
