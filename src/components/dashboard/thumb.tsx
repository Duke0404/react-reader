import { Link, useNavigate } from "@tanstack/react-router"
import { Document, Thumbnail } from "react-pdf"
import { Book } from "../../db/db"
import styles from "./thumb.module.css"
import { Button, DialogTrigger } from "react-aria-components"
import { MdOutlineDeleteForever, MdOutlineEdit } from "react-icons/md"
import { useState } from "react"
import MetadataEditor from "./metadataEditor"
import { ProgressInfoType } from "../../types/progressInfoType"
import ReadProgress from "./readProgress"
import DeleteConfirmation from "./deleteConfirmation"

interface props {
	book: Book
	handleDelete: (id: number) => void
	handleSave: (book: Book) => void
}

export default function Thumb({ book, handleDelete, handleSave }: props) {
	const navigate = useNavigate()

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
			{/* {metaEdit ? (
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
			) : ( */}
			<div className={styles.book}>
				<div className={styles["cover"]}>
					{cover ? (
						<Link to={"/" + book.id + "/1"}>
							<img
								src={URL.createObjectURL(cover)}
								className={styles["image"]}
								alt={title + " book cover"}
							/>
						</Link>
					) : (
						<Document file={book.data}>
							<Thumbnail
								className={styles.page}
								pageNumber={1}
								height={375}
								width={234}
								onItemClick={() => navigate({ to: "/" + book.id + "/1" })}
							/>
						</Document>
					)}
					{(hover || confirmDelete || metaEdit) && (
						<div className={styles["action-group"]}>
							<DialogTrigger>
								<Button
									onPress={() => setConfirmDelete(true)}
									className="red-button react-aria-Button"
								>
									<MdOutlineDeleteForever />
								</Button>
								<DeleteConfirmation
									title={book.title}
									handleDelete={() => handleDelete(book.id)}
									remove={() => {
										setConfirmDelete(false)
										setHover(false)
									}}
								/>
							</DialogTrigger>
							<DialogTrigger>
								<Button onPress={() => setMetaEdit(true)}>
									<MdOutlineEdit />
								</Button>
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
							</DialogTrigger>
						</div>
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
			{/* )} */}
		</div>
	)
}
