import { Button } from "react-aria-components"
import styles from "./actionBar.module.css"
import {
	MdOutlineKeyboardDoubleArrowDown,
	MdOutlineKeyboardDoubleArrowRight,
	MdArrowBack,
	MdArrowForward,
	MdArrowUpward,
	MdArrowDownward
} from "react-icons/md"
import { ReadingDirection } from "../../types/readingDirection"

interface props {
	currPages: number[]
	totalPage: number
	direction: ReadingDirection
	toggleDirection: () => void
	handleDeltaPage: (delta: number) => void
}

export default function ActionBar({
	currPages,
	totalPage,
	direction,
	toggleDirection,
	handleDeltaPage
}: props) {
	return (
		<nav className={styles["bar"]}>
			<div className={styles["item"]}>
				{currPages[0] === currPages[1] || direction === ReadingDirection.horizontal
					? currPages[0]
					: currPages[0] + " - " + currPages[1]}
				{" / " + totalPage}
			</div>
			<div className={styles["button-group"]}>
				<Button onPress={() => handleDeltaPage(-1)}>
					{direction === ReadingDirection.vertical ? <MdArrowUpward /> : <MdArrowBack />}
				</Button>

				<Button onPress={() => handleDeltaPage(1)}>
					{direction === ReadingDirection.vertical ? (
						<MdArrowDownward />
					) : (
						<MdArrowForward />
					)}
				</Button>
			</div>
			{direction === ReadingDirection.vertical ? (
				<Button onPress={toggleDirection}>
					<MdOutlineKeyboardDoubleArrowRight />
				</Button>
			) : (
				<Button onPress={toggleDirection}>
					<MdOutlineKeyboardDoubleArrowDown />
				</Button>
			)}
		</nav>
	)
}
