import { useLiveQuery } from "dexie-react-hooks"
import { pdfjs } from "react-pdf"
import { useContext, useState } from "react"
import { BackendContext } from "../../contexts/backend"
import { Button, FileTrigger } from "react-aria-components"
import { MdAdd } from "react-icons/md"

import { Book, db } from "../../db/db"
import styles from "./dashboard.module.css"
import Placeholder from "./placeholder"
import { SortBy } from "../../enums/booksSortBy"
import { MdOutlineCloudDone, MdOutlineCloudOff, MdOutlineSettings } from "react-icons/md"
import { useTranslation } from "react-i18next"
import SortPopup from "./sortPopup"
import BookInfo from "./bookInfo/bookInfo"
import { ProgressInfoType } from "../../enums/progressInfoType"
import { BookContext } from "../../contexts/book"
import OptionsBar from "./optionsBar/optionsBar"

export default function Dashboard() {
	const [fileError, setFileError] = useState("")
	const [books, setBooks] = useState<Book[]>([])

	const [sortBy, setSortBy] = useState(SortBy.LastRead)

	function handleChangeSortOrder(order: SortBy) {
		setSortBy(order)
		setBooks(books.sort(sortBooks))
	}

	function sortBooks(a: Book, b: Book) {
		switch (sortBy) {
			case SortBy.Title:
				return a.title.localeCompare(b.title)
			case SortBy.Author:
				return (a.author || "").localeCompare(b.author || "")
			case SortBy.LastRead:
				return b.lastReadTime - a.lastReadTime
			case SortBy.LastAdded:
				return b.addTime - a.addTime
		}
	}

	// Fetch books from the indexedDB
	useLiveQuery(async () => {
		setBooks((await db.books.toArray()).sort(sortBooks))
	})

	// Send uploaded file to the indexedDB
	async function handleFileUpload(files: FileList | null) {
		if (files) {
			for (const file of files) {
				try {
					const estimate = await navigator.storage.estimate()
					const availableSpace =
						estimate && estimate.quota && estimate.usage
							? estimate.quota - estimate.usage
							: null
					if (availableSpace && file.size > availableSpace) {
						setFileError("Not enough space")
					}
				} catch (error) {
					console.error(error)
					setFileError("Error checking available space")
				}

				try {
					const arrayBuffer = await file.arrayBuffer()
					const pdf = await pdfjs.getDocument(arrayBuffer).promise
					if (!pdf) throw new Error("Error loading PDF")

					const numPages = pdf.numPages

					const metadata = await pdf.getMetadata()
					const author: string | undefined =
						metadata && metadata.info && "Author" in metadata.info
							? (metadata.info.Author as string)
							: undefined

					if (!numPages) throw new Error("Error getting number of pages")

					const title = file.name.substring(0, file.name.length - 4).replace(/_/g, " ")
					const currTime = Date.now()

					await db.books.add({
						title: title,
						author: author,
						data: file,
						totalPages: numPages,
						currentPage: 1,
						lastReadPage: 1,
						addTime: currTime,
						lastReadTime: currTime,
						cover: null
					})
				} catch (error) {
					console.error(error)
					setFileError("Error uploading file")
				}
			}
		}
	}

	// Delete book from state and indexedDB
	async function deleteBook(bookId: number) {
		await db.books.delete(bookId)
		setBooks(books.filter(book => book.id !== bookId))
	}

	// Save changes to book in state and indexedDB
	async function changeBook(book: Book) {
		await db.books.put(book)
		setBooks(books.map(b => (b.id === book.id ? book : b)))
	}

	const [progressInfoType] = useState(ProgressInfoType.page)

	const backend = useContext(BackendContext)

	const { t } = useTranslation()

	return (
		<>
			{/* <nav className={styles["navbar"]}>
				<img
					src={darkmode() ? bannerLogoDark : bannerLogoLight}
					id={styles.banner}
				/>
				<div className={styles["navbar-buttons"]}>
					<Button
						className="react-aria-Button subtle-button"
						aria-label={t("Backend connection")}
					>
						{backend ? <MdOutlineCloudDone /> : <MdOutlineCloudOff />}
					</Button>

					<Button
						className="react-aria-Button subtle-button"
						aria-label={t("Settings")}
					>
						<MdOutlineSettings />
					</Button>
					<SortPopup
						handleChangeSortOrder={handleChangeSortOrder}
						sortBy={sortBy}
					/>
				</div>
			</nav> */}
			<OptionsBar />
			<div>
				<section className={styles.dashboard}>
					{books.length > 0 ? (
						books.map(book => (
							<>
								<BookContext.Provider
									value={{ book, deleteBook, changeBook }}
									key={book.id}
								>
									<BookInfo progressInfoType={progressInfoType} />
								</BookContext.Provider>
							</>
						))
					) : (
						<Placeholder />
					)}
				</section>

				{fileError && <div>{fileError}</div>}

				<FileTrigger
					acceptedFileTypes={["application/pdf"]}
					allowsMultiple
					onSelect={handleFileUpload}
				>
					<Button className={styles.addButton + " react-aria-Button"}>
						<MdAdd />
					</Button>
				</FileTrigger>
			</div>
		</>
	)
}
