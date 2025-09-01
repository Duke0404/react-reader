import { useEffect } from "react"
import { useContext, useReducer, useState } from "react"

import { ReaderSettingsContext } from "../../contexts/readerSettings"
import { db } from "../../db/db"
import { ReadingDirection } from "../../enums/readingDirection"
import { BionicSettings } from "../../interfaces/bionicSettings"
import { Book } from "../../interfaces/book"
import { ReadAloudSettings } from "../../interfaces/readAloudSettings"
import { ReaderSettings } from "../../interfaces/readerSettings"
import { TranslationSettings } from "../../interfaces/translationSettings"
import ActionBar from "./actionBar/actionBar"
import HorizontalReader from "./horizontalReader"
import styles from "./reader.module.css"
import SettingsPane from "./settingsPane/settingsPane"
import VerticalReader from "./verticalReader"

interface ReaderProps {
	bookId: number
	initPage: number
}

function ReaderContent({ book, initPage }: { book: Book; initPage: number }) {
	const { readingDirection } = useContext(ReaderSettingsContext).settings
	const [settingsOpen, toggleSettingsOpen] = useReducer(so => !so, false)

	if (!book) return <p>Book not found</p>

	return (
		<div className={styles["reader-wrapper"]}>
			<div className={styles["document-wrapper"]}>
				{readingDirection === ReadingDirection.horizontal ? (
					<HorizontalReader
						book={book}
						initPage={initPage}
					/>
				) : (
					<VerticalReader
						book={book}
						initPage={initPage}
					/>
				)}
			</div>
			<ActionBar toggleSettings={toggleSettingsOpen} />
			<SettingsPane 
				isOpen={settingsOpen} 
				onOpenChange={toggleSettingsOpen} 
			/>
		</div>
	)
}

export default function Reader(props: ReaderProps) {
	const [book, setBook] = useState<Book>()
	const [settings, setSettings] = useState<ReaderSettings>({
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
	})

	useEffect(() => {
		db.books.get(+props.bookId).then(fetchedBook => {
			if (fetchedBook) {
				setBook(fetchedBook)
				setSettings(fetchedBook.settings)
			}
		})
	}, [props.bookId])

	const updateBionic = (bionic: Partial<BionicSettings>) => {
		const newSettings = { ...settings, bionic: { ...settings.bionic, ...bionic } }
		setSettings(newSettings)
		// Update database
		if (book) {
			db.books.update(book.id, { settings: newSettings })
		}
	}

	const updateReadAloud = (readAloud: Partial<ReadAloudSettings>) => {
		const newSettings = { ...settings, readAloud: { ...settings.readAloud, ...readAloud } }
		setSettings(newSettings)
		// Update database
		if (book) {
			db.books.update(book.id, { settings: newSettings })
		}
	}

	const updateTranslation = (translation: Partial<TranslationSettings>) => {
		const newSettings = { ...settings, translation: { ...settings.translation, ...translation } }
		setSettings(newSettings)
		// Update database
		if (book) {
			db.books.update(book.id, { settings: newSettings })
		}
	}

	const updateReadingDirection = (readingDirection: ReadingDirection) => {
		const newSettings = { ...settings, readingDirection }
		setSettings(newSettings)
		// Update database
		if (book) {
			db.books.update(book.id, { settings: newSettings })
		}
	}

	const updateScale = (scale: number) => {
		const newSettings = { ...settings, scale }
		setSettings(newSettings)
		// Update database
		if (book) {
			db.books.update(book.id, { settings: newSettings })
		}
	}

	const updateColorMode = (colorMode: Partial<ReaderSettings["colorMode"]>) => {
		const newSettings = { ...settings, colorMode: { ...settings.colorMode, ...colorMode } }
		setSettings(newSettings)
		// Update database
		if (book) {
			db.books.update(book.id, { settings: newSettings })
		}
	}

	// Don't render until we have the book data
	if (!book) return <p>Loading...</p>

	return (
		<ReaderSettingsContext.Provider
			value={{
				settings,
				setSettings,
				updateBionic,
				updateReadAloud,
				updateTranslation,
				updateReadingDirection,
				updateScale,
				updateColorMode
			}}
		>
			<ReaderContent
				book={book}
				initPage={props.initPage}
			/>
		</ReaderSettingsContext.Provider>
	)
}
