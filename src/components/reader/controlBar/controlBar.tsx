import { useContext } from "react"
import { Button } from "react-aria-components"
import { MdArrowBack, MdArrowDownward, MdArrowForward, MdArrowUpward } from "react-icons/md"

import { ReaderSettingsContext } from "../../../contexts/readerSettings"
import { ReadingDirection } from "../../../enums/readingDirection"
import styles from "./controlBar.module.css"

interface props {
	currPages: number[]
	totalPage: number
	handleDeltaPage: (delta: number) => void
}

export default function ControlBar({ currPages, totalPage, handleDeltaPage }: props) {
	const { readingDirection } = useContext(ReaderSettingsContext).settings

	return (
		<nav className={styles["bar"]}>
			<div className={styles["item"]}>
				{currPages[0] === currPages[1] || readingDirection === ReadingDirection.horizontal
					? currPages[0]
					: currPages[0] + " - " + currPages[1]}
				{" / " + totalPage}
			</div>
			<div className={styles["button-group"]}>
				<Button 
					onPress={() => handleDeltaPage(-1)}
					aria-label={readingDirection === ReadingDirection.vertical ? "Previous page (up)" : "Previous page"}
				>
					{readingDirection === ReadingDirection.vertical ? (
						<MdArrowUpward aria-hidden="true" />
					) : (
						<MdArrowBack aria-hidden="true" />
					)}
				</Button>

				<Button 
					onPress={() => handleDeltaPage(1)}
					aria-label={readingDirection === ReadingDirection.vertical ? "Next page (down)" : "Next page"}
				>
					{readingDirection === ReadingDirection.vertical ? (
						<MdArrowDownward aria-hidden="true" />
					) : (
						<MdArrowForward aria-hidden="true" />
					)}
				</Button>
			</div>
		</nav>
	)
}
