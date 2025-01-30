import { useLiveQuery } from "dexie-react-hooks"
import { getDocument } from "pdfjs-dist"
import { useEffect, useState } from "react"
import {
	Button,
	DropZone,
	FileTrigger,
	ToggleButton,
	ToggleButtonGroup
} from "react-aria-components"
import { MdAdd } from "react-icons/md"

import { useNavigate } from "@tanstack/react-router"

import bannerLogoDark from "../../assets/banner-logo-dark.svg"
import bannerLogoLight from "../../assets/banner-logo-light.svg"
import { Book, db } from "../../db/db"
import checkRegistration from "../../utils/checkRegistration"
import darkmode from "../../utils/darkmode"
import styles from "./dashboard.module.css"
import Placeholder from "./placeholder"
import Thumbnail from "./thumb"

export default function Dashboard() {
	const navigate = useNavigate()

	// Check if the user is registered, else redirect to the registration page
	useEffect(() => {
		if (!checkRegistration()) {
			navigate({ to: "/register" })
		}
	}, [navigate])

	const [fileError, setFileError] = useState("")
	const [books, setBooks] = useState<Book[]>([])

	enum SortBy {
		Title,
		Author,
		LastRead,
		LastAdded
	}

	const [sortBy, setSortBy] = useState(SortBy.LastRead)

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
					const pdf = await getDocument(arrayBuffer).promise
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
						lastReadTime: currTime
					})
				} catch (error) {
					console.error(error)
					setFileError("Error uploading file")
				}
			}
		}
	}

	// Delete book from state and indexedDB
	async function handleDeleteBook(bookId: number) {
		await db.books.delete(bookId)
		setBooks(books.filter(book => book.id !== bookId))
	}

	// Save changes to book in state and indexedDB
	async function handleSaveBook(book: Book) {
		await db.books.put(book)
		setBooks(books.map(b => (b.id === book.id ? book : b)))
	}

	function handleChangeSortOrder(order: SortBy) {
		setSortBy(order)
		setBooks(books.sort(sortBooks))
	}

	return (
		<>
			<nav className={styles["navbar"]}>
				<img
					src={darkmode() ? bannerLogoDark : bannerLogoLight}
					id={styles.banner}
				/>

				<ToggleButtonGroup
					aria-label="Sort by"
					className={styles["sort-buttons"]}
					selectedKeys={[sortBy]}
					onSelectionChange={keys => handleChangeSortOrder(Array.from(keys)[0] as SortBy)}
				>
					<ToggleButton id={SortBy.Title}>Title</ToggleButton>
					<ToggleButton id={SortBy.Author}>Author</ToggleButton>
					<ToggleButton id={SortBy.LastRead}>Last Read</ToggleButton>
					<ToggleButton id={SortBy.LastAdded}>Last Added</ToggleButton>
				</ToggleButtonGroup>
			</nav>

			<DropZone
				className={styles["drop-area"]}
				onDrop={async event => {
					setFileError("")
					const filteredItems = event.items.filter(item => item.kind === "file")
					const files = (
						await Promise.all(filteredItems.map(item => item.getFile()))
					).filter(file => file.type === "application/pdf")
					const dataTransfer = new DataTransfer()
					files.forEach(file => dataTransfer.items.add(file))
					handleFileUpload(dataTransfer.files)
				}}
			>
				{books.length === 0 && <Placeholder />}
			</DropZone>

			<div>
				<section className={styles.dashboard}>
					{books.map(book => (
						<Thumbnail
							book={book}
							handleDelete={handleDeleteBook}
							handleSave={handleSaveBook}
							key={book.id}
						/>
					))}
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
