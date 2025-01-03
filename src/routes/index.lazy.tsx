import { useEffect, useState } from "react"
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router"
import checkRegistration from "../utils/checkRegistration"
import { FileTrigger, DropZone, Button } from "react-aria-components"
import { useLiveQuery } from "dexie-react-hooks"
import { db, Book } from "../db/db"
import styles from "./index.module.css"
import { MdAdd } from "react-icons/md"
import Thumbnail from "../components/index/thumbnail"
import { getDocument } from "pdfjs-dist"
import bannerLogoLight from "../assets/banner-logo-light.svg"
import bannerLogoDark from "../assets/banner-logo-dark.svg"
import darkmode from "../utils/darkmode"
import Placeholder from "../components/index/placeholder"

export const Route = createLazyFileRoute("/")({
	component: Index
})

function Index() {
	const navigate = useNavigate()

	// Check if the user is registered, else redirect to the registration page
	useEffect(() => {
		if (!checkRegistration()) {
			navigate({ to: "/register" })
		}
	}, [navigate])

	const [fileError, setFileError] = useState("")
	const [books, setBooks] = useState<Book[]>([])

	// Fetch books from the indexedDB
	useLiveQuery(async () => {
		setBooks(await db.books.toArray())
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

					await db.books.add({
						title: title,
						author: author,
						data: file,
						totalPages: numPages,
						currentPage: 1
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

	return (
		<>
			<nav className={styles.navbar}>
				<img
					src={darkmode() ? bannerLogoDark : bannerLogoLight}
					id={styles.banner}
				/>
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
						<span>Add book</span>
					</Button>
				</FileTrigger>
			</div>
		</>
	)
}
