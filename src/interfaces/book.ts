import { ReaderSettings } from "./readerSettings"

export interface Book {
	id: number
	title: string
	author: string | null
	currentPage: number
	totalPages: number
	cover: File | null
	data: File
	lastReadPage: number
	addTime: number
	lastReadTime: number
	settings: ReaderSettings
}
