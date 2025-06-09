import { useLiveQuery } from "dexie-react-hooks"
import { useContext, useReducer, useState } from "react"

import { useNavigate } from "@tanstack/react-router"

import { BionicConfigContext } from "../../contexts/bionicConfig"
import { ReadAloudConfigContext } from "../../contexts/readAloudConfig"
import { ReadingDirectionContext } from "../../contexts/readingDirection"
import { Book, db } from "../../db/db"
import { ReadingDirection } from "../../enums/readingDirection"
import { BionicSettings } from "../../interfaces/bionicSettings"
import { ReadAloudSettings } from "../../interfaces/readAloudSettings"
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
	const { readingDirection } = useContext(ReadingDirectionContext)
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
	const [bionicConfig, setBionicConfig] = useState<BionicSettings>({
		on: false,
		highlightSize: 3,
		highlightJump: 1,
		highlightMultiplier: 4,
		lowlightOpacity: 0.6
	})

	const [readAloudConfig, setReadAloudConfig] = useState<ReadAloudSettings>({
		on: false,
		localAlways: false,
		playFullPage: true
	})

	const [readingDirection, setReadingDirection] = useState(ReadingDirection.vertical)

	return (
		<BionicConfigContext.Provider value={{ bionicConfig, setBionicConfig }}>
			<ReadAloudConfigContext.Provider value={{ readAloudConfig, setReadAloudConfig }}>
					<ReadingDirectionContext.Provider
						value={{ readingDirection, setReadingDirection }}
					>
						<ReaderContent {...props} />
					</ReadingDirectionContext.Provider>
			</ReadAloudConfigContext.Provider>
		</BionicConfigContext.Provider>
	)
}
