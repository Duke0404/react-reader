import { ReadingDirection } from "../enums/readingDirection"
import { BionicSettings } from "./bionicSettings"
import { ReadAloudSettings } from "./readAloudSettings"

export interface ReaderSettings {
    bionic: BionicSettings
    readAloud: ReadAloudSettings
    readingDirection: ReadingDirection
    scale: number
}