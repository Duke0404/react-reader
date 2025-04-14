import { useContext } from "react"
import { BookContext } from "../../../../../../contexts/book"
import CoverFromPdf from "../../../coverFromPdf/coverFromPdf"
import styles from "./coverEditor.module.css"
import { FileTrigger, Button } from "react-aria-components"
import { MdOutlineFileUpload, MdOutlineRestore } from "react-icons/md"

export default function CoverEditor() {
	const bookContext = useContext(BookContext)
	const book = bookContext?.book

	function handleChangeCover(cover: File | null) {
		if (bookContext && book) {
			bookContext.changeBook({
				...book,
				cover
			})
		}
	}

	return (
		bookContext &&
		book && (
			<div className={styles["container"]}>
				{/* Book cover */}
				<div className={styles["preview"]}>
					{book.cover ? (
						<img
							src={URL.createObjectURL(book.cover)}
							alt={book.title}
							className={styles["image-cover"]}
						/>
					) : (
						<CoverFromPdf pdf={book.data} />
					)}
				</div>

				<div className={styles["editor"]}>
					{/* Upload cover button */}
					<FileTrigger
						acceptedFileTypes={["image/*"]}
						onSelect={files => files && files.length > 0 && handleChangeCover(files[0])}
					>
						<Button>
							<MdOutlineFileUpload />
							<span>Custom cover</span>
						</Button>
					</FileTrigger>

					{/* Reset to default button */}
					<Button
						aria-label="Reset cover"
						onPress={() => handleChangeCover(null)}
					>
						<MdOutlineRestore />
						<span>Reset cover</span>
					</Button>
				</div>
			</div>
		)
	)
}
