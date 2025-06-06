import { Dispatch, SetStateAction, createContext } from "react"

import { BionicSettings } from "../interfaces/bionicSettings"

export const BionicConfigContext = createContext<{
	bionicConfig: BionicSettings
	setBionicConfig: Dispatch<SetStateAction<BionicSettings>>
}>({
	bionicConfig: {
		on: false,
		highlightSize: 3,
		highlightJump: 1,
		highlightMultiplier: 4,
		lowlightOpacity: 0.6
	},
	setBionicConfig: () => {
		throw new Error("BionicConfigContext is not provided")
	}
})
