import { useEffect, useState } from "react"
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router"
import checkRegistration from "../utils/checkRegistration"
import { FileTrigger, DropZone, Button } from "react-aria-components"
import { Document, Page } from "react-pdf"
import { useLiveQuery } from "dexie-react-hooks"
import { db, Book } from "../db/db"
import styles from "./index.module.css"
import { BiAddToQueue } from "react-icons/bi";

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

	async function handleFileUpload(files: FileList | null) {
		if (files && files[0]) {
			const file = files[0]
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
				await db.books.add({
					title: file.name,
					data: file
				})
			} catch (error) {
				console.error(error)
				setFileError("Error uploading file")
			}
		}
	}

	return (
		<>
			<DropZone >
				<section className={styles.dashboard}>
					{books.map(book => (
						<>
							<div className={styles.book}>
								<Document
									file={book.data}
									key={"book-" + book.id}
								>
									<Page
										pageNumber={1}
										renderTextLayer={false}
										renderAnnotationLayer={false}
										height={375}
										width={234}
									/>
								</Document>
								<span className={styles.title}>{book.title}</span>
							</div>
						</>
					))}</section>
			</DropZone>
			{fileError && <div>{fileError}</div>}

			<FileTrigger
				acceptedFileTypes={["application/pdf"]}
				onSelect={handleFileUpload}
			>
				<Button className={styles.addButton + " react-aria-Button"}><BiAddToQueue /></Button>
			</FileTrigger>
		</>
	)
}
