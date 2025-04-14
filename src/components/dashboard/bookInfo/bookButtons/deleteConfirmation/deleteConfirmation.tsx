import { useContext } from "react"
import { BookContext } from "../../../../../contexts/book"
import { Dialog, Modal, Button } from "react-aria-components"
import { MdOutlineClose, MdOutlineDeleteForever } from "react-icons/md"
import styles from "./deleteConfirmation.module.css"

export default function DeleteConfirmation() {
	const bookContext = useContext(BookContext)
	const book = bookContext?.book

	function handleDelete() {
		if (bookContext && book) {
			bookContext.deleteBook(book.id)
		}
	}

	return (
		<Modal>
			<Dialog role="alertdialog">
				<div>
					Delete <span className="red-text">{book?.title}</span> Permanently?
				</div>
				<div>This action cannot be undone.</div>
				<div className={styles["buttons"]}>
					{/* Cancel button */}
					<Button
						slot="close"
						aria-label="Cancel"
					>
						<MdOutlineClose />
					</Button>

					{/* Permanently delete button */}
					<Button
						slot="close"
						aria-label="Delete"
						className="react-aria-Button red-button"
						onPress={handleDelete}
					>
						<MdOutlineDeleteForever />
						<span>Delete forever</span>
					</Button>
				</div>
			</Dialog>
		</Modal>
	)
}
