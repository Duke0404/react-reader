import { useState, useContext } from "react"
import { BookContext } from "../../../../../contexts/book"
import {
	Button,
	Dialog,
	FieldError,
	Form,
	Input,
	Label,
	Modal,
	TextField
} from "react-aria-components"
import { MdOutlineClose, MdOutlineSave } from "react-icons/md"
import CoverEditor from "./coverEditor/coverEditor"
import styles from "./metadataEditor.module.css"

export default function MetadataEditor() {
	const bookContext = useContext(BookContext)
	const book = bookContext?.book

	const [title, setTitle] = useState(book?.title || "")
	const [author, setAuthor] = useState(book?.author || "")

	function handleSave() {
		if (bookContext && book) {
			bookContext.changeBook({
				...book,
				title,
				author
			})
		}
	}

	return (
		bookContext &&
		book && (
			<Modal>
				<Dialog>
					<Form>
						<TextField
							value={title}
							onChange={setTitle}
						>
							<Label>Title</Label>
							<Input />
							<FieldError />
						</TextField>

						<TextField
							value={author}
							onChange={setAuthor}
						>
							<Label>Author</Label>
							<Input />
							<FieldError />
						</TextField>

						{/* Book cover */}
						<CoverEditor />

						<div className={styles["buttons"]}>
							{/* Save button */}
							<Button
								slot="close"
								aria-label="Save"
								className="react-aria-Button blue-button"
								onPress={handleSave}
							>
								<MdOutlineSave />
							</Button>

							{/* Cancel button */}
							<Button
								slot="close"
								aria-label="Cancel"
								className="react-aria-Button red-button"
							>
								<MdOutlineClose />
							</Button>
						</div>
					</Form>
				</Dialog>
			</Modal>
		)
	)
}
