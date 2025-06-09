import { Button } from "react-aria-components"
import {
	MdOutlineHeadphones,
	MdOutlinePause,
	MdOutlinePlayArrow,
	MdOutlineStop
} from "react-icons/md"

import useReadAloud from "../../../hooks/useReadAloud"
import styles from "./readAloudBar.module.css"

interface props {
	pageRef: HTMLDivElement | null
}

export default function ReadAloudBar({ pageRef }: props) {
	const { loadAndReadText, pause, resume, stop, isPlaying, isPaused } = useReadAloud()

	const handleButtonPress = () => {
		if (isPlaying) {
			pause()
		} else if (isPaused) {
			resume()
		} else {
			loadAndReadText(pageRef)
		}
	}

	return (
		<div className={styles["container"]}>
			<MdOutlineHeadphones />
			<div className={styles["controls"]}>
				<Button onPress={handleButtonPress}>
					{isPlaying ? <MdOutlinePause /> : <MdOutlinePlayArrow />}
				</Button>
				<Button
					onPress={stop}
					isDisabled={!isPlaying && !isPaused} // Enable stop button when playing OR paused
				>
					<MdOutlineStop />
				</Button>
			</div>
		</div>
	)
}
