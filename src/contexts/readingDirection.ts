import { createContext, Dispatch, SetStateAction } from "react"
import { ReadingDirection } from "../enums/readingDirection"

export const ReadingDirectionContext = createContext<{
	readingDirection: ReadingDirection
	setReadingDirection: Dispatch<SetStateAction<ReadingDirection>>
}>({
	readingDirection: ReadingDirection.vertical,
	setReadingDirection: () => {
		throw new Error("ReadingDirectionContext is not provided")
	}
})
