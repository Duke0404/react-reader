import { ReadingDirection } from "../enums/readingDirection"
import { BionicSettings } from "./bionicSettings"
import { ColorModeSettings } from "./colorModeSettings"
import { ReadAloudSettings } from "./readAloudSettings"
import { TranslationSettings } from "./translationSettings"

export interface ReaderSettings {
	bionic: BionicSettings
	readAloud: ReadAloudSettings
	translation: TranslationSettings
	readingDirection: ReadingDirection
	scale: number
	colorMode: ColorModeSettings
}
