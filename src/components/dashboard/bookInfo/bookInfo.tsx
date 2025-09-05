import { useContext } from "react"

import { Link } from "@tanstack/react-router"

import { BookContext } from "../../../contexts/book"
import { ProgressInfoType } from "../../../enums/progressInfoType"
import BookButtons from "./bookButtons/bookButtons"
import styles from "./bookInfo.module.css"
import CoverFromPdf from "./coverFromPdf/coverFromPdf"
import ReadProgress from "./readProgress/readProgress"

interface props {
	progressInfoType: ProgressInfoType
}

export default function BookInfo({ progressInfoType }: props) {
	const bookContext = useContext(BookContext)
	const book = bookContext?.book

	return (
		bookContext &&
		book && (
			<article className={styles["container"]}>
				<Link
					to={"/" + book.id + "/" + book.currentPage}
					className={styles["info-card"]}
					aria-label={`Read ${book.title}${book.author ? ` by ${book.author}` : ""}`}
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
						lastReadPage={book.lastReadPage}
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
			</article>
		)
	)
}
