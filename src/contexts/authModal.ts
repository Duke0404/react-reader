import { createContext, Dispatch, SetStateAction } from "react"

export const AuthModalContext = createContext<{
	authModalOpen: boolean
	setAuthModalOpen: Dispatch<SetStateAction<boolean>>
	authModalMessage?: string
	setAuthModalMessage?: Dispatch<SetStateAction<string>>
}>({
	authModalOpen: false,
	setAuthModalOpen: () => {
		throw new Error("AuthModalContext is not provided")
	},
	authModalMessage: "",
	setAuthModalMessage: () => {
		throw new Error("AuthModalContext is not provided")
	}
})
