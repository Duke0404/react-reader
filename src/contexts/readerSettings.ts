import { Dispatch, SetStateAction, createContext } from "react"

import { ReadingDirection } from "../enums/readingDirection"
import { BionicSettings } from "../interfaces/bionicSettings"
import { ColorModeSettings } from "../interfaces/colorModeSettings"
import { ReadAloudSettings } from "../interfaces/readAloudSettings"
import { ReaderSettings } from "../interfaces/readerSettings"
import { TranslationSettings } from "../interfaces/translationSettings"

export const ReaderSettingsContext = createContext<{
	settings: ReaderSettings
	setSettings: Dispatch<SetStateAction<ReaderSettings>>
	updateBionic: (bionic: Partial<BionicSettings>) => void
	updateReadAloud: (readAloud: Partial<ReadAloudSettings>) => void
	updateTranslation: (translation: Partial<TranslationSettings>) => void
	updateReadingDirection: (direction: ReadingDirection) => void
	updateScale: (scale: number) => void
	updateColorMode: (colorMode: Partial<ColorModeSettings>) => void
}>({
	settings: {
		bionic: {
			on: false,
			highlightSize: 3,
			highlightJump: 1,
			highlightMultiplier: 4,
			lowlightOpacity: 0.6
		},
		readAloud: {
			on: false,
			localAlways: false,
			playFullPage: true
		},
		translation: {
			on: false,
			targetLanguage: "en"
		},
		readingDirection: ReadingDirection.vertical,
		scale: 1,
		colorMode: {
			on: false,
			mode: "stdDark"
		}
	},
	setSettings: () => {
		throw new Error("SettingsContext is not provided")
	},
	updateBionic: () => {
		throw new Error("SettingsContext is not provided")
	},
	updateReadAloud: () => {
		throw new Error("SettingsContext is not provided")
	},
	updateTranslation: () => {
		throw new Error("SettingsContext is not provided")
	},
	updateReadingDirection: () => {
		throw new Error("SettingsContext is not provided")
	},
	updateScale: () => {
		throw new Error("SettingsContext is not provided")
	},
	updateColorMode: () => {
		throw new Error("SettingsContext is not provided")
	}
})
