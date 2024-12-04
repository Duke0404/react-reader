import { Link } from "@tanstack/react-router"
import { Document, Page } from "react-pdf"
import { Book } from "../../db/db"
import styles from "./thumbnail.module.css"
import { Button, Meter, TextField, Form, Input, Label, FieldError } from "react-aria-components"
import { MdOutlineDeleteForever, MdOutlineEdit, MdClose, MdOutlineSave } from "react-icons/md"
import { useState } from "react"

interface props {
	book: Book
	handleDelete: (id: number) => void
	handleSave: (book: Book) => void
}

enum ProgressIndicator {
	percentage,
	page
}

export default function Thumbnail({ book, handleDelete, handleSave }: props) {
	const [hover, setHover] = useState(false)
	const [metaEdit, setMetaEdit] = useState(false)

	const [title, setTitle] = useState(book.title)
	const [author, setAuthor] = useState(book.author)

	const [progressIndicator] = useState<ProgressIndicator>(ProgressIndicator.page)

	function cancelMetaEdit() {
		setMetaEdit(false)
		setTitle(book.title)
		setAuthor(book.author)
	}

	function saveMetaEdit() {
		setMetaEdit(false)
		// Save the new metadata to indexedDB
		handleSave({
			...book,
			title,
			author
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
			className={styles.book}
		>
			{metaEdit ? (
				<Form className={styles.metaForm}>
					<TextField
						name="book-title"
						maxLength={30}
						onInput={e => setTitle(e.currentTarget.value)}
						value={title}
					>
						<Label>Title</Label>
						<Input />
						<FieldError />
					</TextField>
					<TextField
						name="book-author"
						maxLength={30}
						onInput={e => setAuthor(e.currentTarget.value)}
						value={author}
					>
						<Label>Author</Label>
						<Input />
						<FieldError />
					</TextField>
					<div className={styles.metaActionGroup}>
						<Button
							onPress={cancelMetaEdit}
							className={styles.negativeButton + " react-aria-Button"}
						>
							<MdClose />
							<span>Cancel</span>
						</Button>
						<Button
							onPress={saveMetaEdit}
							className={styles.positiveButton + " react-aria-Button"}
						>
							<MdOutlineSave />
							<span>Save</span>
						</Button>
					</div>
				</Form>
			) : (
				<div className={styles.book}>
					<div className={styles.cover}>
						<Link to={"/" + book.id + "/1"}>
							<Document
								file={book.data}
								key={"book-" + book.id}
							>
								<Page
									className={styles.page}
									pageNumber={1}
									renderTextLayer={false}
									renderAnnotationLayer={false}
									height={375}
									width={234}
								/>
							</Document>
						</Link>
						{hover && (
							<div className={styles.actionGroup}>
								<Button
									onPress={() => handleDelete(book.id)}
									className={styles.negativeButton + " react-aria-Button"}
								>
									<MdOutlineDeleteForever />
									<span>Delete</span>
								</Button>
								<Button onPress={() => setMetaEdit(me => !me)}>
									<MdOutlineEdit />
									<span>Edit</span>
								</Button>
							</div>
						)}
					</div>

					<div className={styles.metadata}>
						<span className={styles.title}>
							<Link to={"/" + book.id + "/1"}>{title}</Link>
						</span>

						{author && <span className={styles.author}>{author}</span>}

						<Meter
							value={book.currentPage}
							minValue={1}
							maxValue={book.totalPages}
							className={styles.completionMeter}
							aria-label="Book completion level"
						>
							{({ percentage }) => (
								<>
									<div className={styles.completionMeterBar}>
										<div
											className={styles.completionMeterFill}
											style={{
												width:
													book.totalPages === 1
														? "100%"
														: percentage + "%"
											}}
										/>
									</div>
									<span className={styles.completionMeterValue}>
										{progressIndicator === ProgressIndicator.page ? (
											<>
												{book.currentPage} / {book.totalPages}
											</>
										) : progressIndicator === ProgressIndicator.percentage ? (
											<>{percentage}%</>
										) : (
											<></>
										)}
									</span>
								</>
							)}
						</Meter>
					</div>
				</div>
			)}
		</div>
	)
}
