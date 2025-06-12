import { colorModes } from "../data/colorModes"

export interface ColorModeSettings {
	on: boolean
	mode: keyof typeof colorModes
}
