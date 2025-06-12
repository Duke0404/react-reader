import { useLiveQuery } from "dexie-react-hooks"
import { useContext, useReducer, useState } from "react"

import { useNavigate } from "@tanstack/react-router"

import { ReaderSettingsContext } from "../../contexts/readerSettings"
import { Book, db } from "../../db/db"
import { ReadingDirection } from "../../enums/readingDirection"
import { BionicSettings } from "../../interfaces/bionicSettings"
import { ReadAloudSettings } from "../../interfaces/readAloudSettings"
import { ReaderSettings } from "../../interfaces/readerSettings"
import ActionBar from "./actionBar/actionBar"
import HorizontalReader from "./horizontalReader"
import styles from "./reader.module.css"
import SettingsPane from "./settingsPane/settingsPane"
import VerticalReader from "./verticalReader"

interface ReaderProps {
	bookId: number
	initPage: number
}

function ReaderContent({ bookId, initPage }: ReaderProps) {
	const navigate = useNavigate()
	const { readingDirection } = useContext(ReaderSettingsContext).settings
	const [settingsOpen, toggleSettingsOpen] = useReducer(so => !so, false)
	const [book, setBook] = useState<Book>()

	useLiveQuery(async () => {
		const book = await db.books.get(+bookId)
		if (book) setBook(book)
		else navigate({ to: "/404" })
	})

	if (!book) return <p>Book not found</p>

	return (
		<div className={styles["reader-wrapper"]}>
			{settingsOpen && <SettingsPane />}
			<div className={styles["document-wrapper"]}>
				{readingDirection === ReadingDirection.horizontal ? (
					<HorizontalReader
						bookId={bookId}
						bookData={book.data}
						initPage={initPage}
						totalPages={book.totalPages}
					/>
				) : (
					<VerticalReader
						bookId={bookId}
						bookData={book.data}
						initPage={initPage}
						totalPages={book.totalPages}
					/>
				)}
			</div>
			<ActionBar toggleSettings={toggleSettingsOpen} />
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
		readingDirection: ReadingDirection.vertical,
		scale: 1,
		colorMode: {
			on: false,
			mode: "stdDark"
		}
	})

	// Fetch book and use its settings
	useLiveQuery(async () => {
		const fetchedBook = await db.books.get(+props.bookId)
		if (fetchedBook) {
			setBook(fetchedBook)
			setSettings(fetchedBook.settings)
		}
	})

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
				updateReadingDirection,
				updateScale,
				updateColorMode
			}}
		>
			<ReaderContent {...props} />
		</ReaderSettingsContext.Provider>
	)
}
