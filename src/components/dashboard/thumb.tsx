import { useState } from "react"
import { Button, DialogTrigger } from "react-aria-components"
import { useHover, useFocus } from "react-aria"
import { MdOutlineDeleteForever, MdOutlineEdit } from "react-icons/md"
import { Document, Thumbnail } from "react-pdf"

import { Link, useNavigate } from "@tanstack/react-router"

import { Book } from "../../db/db"
import { ProgressInfoType } from "../../enums/progressInfoType"
import DeleteConfirmation from "./deleteConfirmation"
import MetadataEditor from "./metadataEditor"
import ReadProgress from "./readProgress"
import styles from "./thumb.module.css"

interface props {
	book: Book
	handleDelete: (id: number) => void
	handleSave: (book: Book) => void
}

export default function Thumb({ book, handleDelete, handleSave }: props) {
	const navigate = useNavigate()

	const [showOptions, setShowOptions] = useState(false)
	const { hoverProps } = useHover({
		onHoverStart: () => setShowOptions(true),
		onHoverEnd: () => setShowOptions(false)
	})
	const { focusProps } = useFocus({
		onFocus: () => setShowOptions(true),
		onBlur: () => setShowOptions(false)
	})

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
			{...hoverProps}
			{...focusProps}
			className={styles.book}
		>
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
				{(showOptions || confirmDelete || metaEdit) && (
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
									setShowOptions(false)
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
	)
}
