import { Link } from "@tanstack/react-router"
import { Document, Page } from "react-pdf"
import { Book } from "../../db/db"
import styles from "./thumbnail.module.css"
import { Button } from "react-aria-components"
import { MdOutlineDeleteForever, MdOutlineEdit, MdClose } from "react-icons/md"
import { useState } from "react"
import MetadataEditor from "./metadataEditor"
import { ProgressInfoType } from "../../types/progressInfoType"
import ReadProgress from "./readProgress"

interface props {
	book: Book
	handleDelete: (id: number) => void
	handleSave: (book: Book) => void
}

export default function Thumbnail({ book, handleDelete, handleSave }: props) {
	const [hover, setHover] = useState(false)
	const [metaEdit, setMetaEdit] = useState(false)

	const [title, setTitle] = useState(book.title)
	const [author, setAuthor] = useState(book.author)
	const [cover, setCover] = useState<Blob | undefined>(book.cover)

	const [progressInfoType] = useState(ProgressInfoType.page)

	const [confirmDelete, setConfirmDelete] = useState(false)

	function cancelMetaEdit() {
		setMetaEdit(false)
		setTitle(book.title)
		setAuthor(book.author)
		setCover(book.cover)
	}

	function saveMetaEdit() {
		setMetaEdit(false)
		// Save the new metadata to indexedDB
		handleSave({
			...book,
			title,
			author,
			cover
		})
	}

	return (
		<div
			onMouseEnter={() => {
				setHover(true)
			}}
			onMouseLeave={() => {
				setHover(false)
			}}
		>
			{metaEdit ? (
				<MetadataEditor
					title={title}
					setTitle={setTitle}
					author={author}
					setAuthor={setAuthor}
					cover={cover}
					setCover={setCover}
					cancelMetaEdit={cancelMetaEdit}
					saveMetaEdit={saveMetaEdit}
				/>
			) : (
				<div className={styles.book}>
					<div className={styles["cover"]}>
						<Link to={"/" + book.id + "/1"}>
							{cover ? (
								<img
									src={URL.createObjectURL(cover)}
									className={styles["image"]}
									alt={title + " book cover"}
								/>
							) : (
								<Document file={book.data}>
									<Page
										className={styles.page}
										pageNumber={1}
										renderTextLayer={false}
										renderAnnotationLayer={false}
										height={375}
										width={234}
									/>
								</Document>
							)}
						</Link>
						{confirmDelete ? (
							<div className={styles.actionGroup}>
								<Button
									onPress={() => handleDelete(book.id)}
									className="red-button react-aria-Button"
								>
									<MdOutlineDeleteForever />
									<span>Yes, Delete</span>
								</Button>
								<Button
									onPress={() => setConfirmDelete(false)}
									className="green-button react-aria-Button"
								>
									<MdClose />
									<span>No, don't delete</span>
								</Button>
							</div>
						) : hover ? (
							<div className={styles.actionGroup}>
								<Button
									onPress={() => setConfirmDelete(true)}
									className="red-button react-aria-Button"
								>
									<MdOutlineDeleteForever />
									<span>Delete</span>
								</Button>
								<Button onPress={() => setMetaEdit(me => !me)}>
									<MdOutlineEdit />
									<span>Edit</span>
								</Button>
							</div>
						) : (
							""
						)}
					</div>

					<div className={styles["meta-section"]}>
						<div className={styles["meta-text"]}>
							<span className={styles.title}>
								<Link to={"/" + book.id + "/1"}>{title}</Link>
							</span>

							{author && <span className={styles.author}>{author}</span>}
						</div>

						<ReadProgress
							currentPage={book.currentPage}
							totalPages={book.totalPages}
							progressInfoType={progressInfoType}
						/>
					</div>
				</div>
			)}
		</div>
	)
}
