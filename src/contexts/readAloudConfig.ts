import { Dispatch, SetStateAction, createContext } from "react"

import { ReadAloudSettings } from "../interfaces/readAloudSettings"

export const ReadAloudConfigContext = createContext<{
	readAloudConfig: ReadAloudSettings
	setReadAloudConfig: Dispatch<SetStateAction<ReadAloudSettings>>
}>({
	readAloudConfig: {
		on: false,
		localAlways: false,
		playFullPage: true
	},
	setReadAloudConfig: () => {
		throw new Error("ReadAloudConfigContext is not provided")
	}
})
