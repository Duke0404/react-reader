import { createContext, Dispatch, SetStateAction } from "react"

export const BackendModalOpenContext = createContext<{
	backendModalOpen: boolean
	setBackendModalOpen: Dispatch<SetStateAction<boolean>>
}>({
	backendModalOpen: false,
	setBackendModalOpen: () => {
		throw new Error("ModalOpenContext is not provided")
	}
})
