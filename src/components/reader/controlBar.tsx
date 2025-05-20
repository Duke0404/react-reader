import { Button } from "react-aria-components"
import {
	MdArrowBack,
	MdArrowDownward,
	MdArrowForward,
	MdArrowUpward
} from "react-icons/md"
import { ReadingDirectionContext } from "../../contexts/readingDirection"
import { ReadingDirection } from "../../enums/readingDirection"
import styles from "./controlBar.module.css"
import { useContext } from "react"

interface props {
	currPages: number[]
	totalPage: number
	handleDeltaPage: (delta: number) => void
}

export default function ControlBar({ currPages, totalPage, handleDeltaPage }: props) {
	const { readingDirection } = useContext(ReadingDirectionContext)

	return (
		<nav className={styles["bar"]}>
			<div className={styles["item"]}>
				{currPages[0] === currPages[1] || readingDirection === ReadingDirection.horizontal
					? currPages[0]
					: currPages[0] + " - " + currPages[1]}
				{" / " + totalPage}
			</div>
			<div className={styles["button-group"]}>
				<Button onPress={() => handleDeltaPage(-1)}>
					{readingDirection === ReadingDirection.vertical ? (
						<MdArrowUpward />
					) : (
						<MdArrowBack />
					)}
				</Button>

				<Button onPress={() => handleDeltaPage(1)}>
					{readingDirection === ReadingDirection.vertical ? (
						<MdArrowDownward />
					) : (
						<MdArrowForward />
					)}
				</Button>
			</div>
			{/* {readingDirection === ReadingDirection.vertical ? (
				<Button onPress={() => setReadingDirection(ReadingDirection.horizontal)}>
					<MdOutlineKeyboardDoubleArrowRight />
				</Button>
			) : (
				<Button onPress={() => setReadingDirection(ReadingDirection.vertical)}>
					<MdOutlineKeyboardDoubleArrowDown />
				</Button>
			)} */}
		</nav>
	)
}
