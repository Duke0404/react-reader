import { Link } from "@tanstack/react-router"
import { useContext } from "react"
import { BookContext } from "../../../contexts/book"

import CoverFromPdf from "./coverFromPdf/coverFromPdf"
import BookButtons from "./bookButtons/bookButtons"
import ReadProgress from "./readProgress/readProgress"

import styles from "./bookInfo.module.css"
import { ProgressInfoType } from "../../../enums/progressInfoType"

interface props {
	progressInfoType: ProgressInfoType
}

export default function BookInfo({ progressInfoType }: props) {
	const bookContext = useContext(BookContext)
	const book = bookContext?.book

	return (
		bookContext &&
		book && (
			<div className={styles["container"]}>
				<Link
					to={"/" + book.id + "/1"}
					className={styles["info-card"]}
				>
					{/* Book cover */}
					{book.cover ? (
						<img
							src={URL.createObjectURL(book.cover)}
							alt={book.title}
							className={styles["image-cover"]}
						/>
					) : (
						<CoverFromPdf pdf={book.data} />
					)}

					{/* Reading progress meter */}
					<ReadProgress
						currentPage={book.currentPage}
						totalPages={book.totalPages}
						progressInfoType={progressInfoType}
					/>

					{/* Book Details */}
					<div className={styles["text-details"]}>
						<div>{book.title}</div>
						{book.author && <div className={styles["author"]}>{book.author}</div>}
					</div>
				</Link>

				{/* Book Buttons */}
				<BookButtons />
			</div>
		)
	)
}
