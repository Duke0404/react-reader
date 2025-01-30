import { Button } from "react-aria-components"
import {
	MdArrowBack,
	MdArrowDownward,
	MdArrowForward,
	MdArrowUpward,
	MdOutlineKeyboardDoubleArrowDown,
	MdOutlineKeyboardDoubleArrowRight
} from "react-icons/md"

import { ReadingDirection } from "../../enums/readingDirection"
import styles from "./controlBar.module.css"

interface props {
	currPages: number[]
	totalPage: number
	direction: ReadingDirection
	toggleDirection: VoidFunction
	handleDeltaPage: (delta: number) => void
}

export default function ControlBar({
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
