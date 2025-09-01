import { Button } from "react-aria-components"
import {
	MdOutlineHeadphones,
	MdOutlinePause,
	MdOutlinePlayArrow,
	MdOutlineStop
} from "react-icons/md"
import { ImSpinner8 } from "react-icons/im"

import useReadAloud from "../../../hooks/useReadAloud"
import styles from "./readAloudBar.module.css"

interface props {
	pageRef: HTMLDivElement | null
}

export default function ReadAloudBar({ pageRef }: props) {
	const { loadAndReadText, pause, resume, stop, isPlaying, isPaused, isLoading } = useReadAloud()

	const handleButtonPress = () => {
		if (isLoading) {
			return // Disable button when loading
		}
		
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
				<Button 
					onPress={handleButtonPress}
					isDisabled={isLoading}
				>
					{isLoading ? (
						<ImSpinner8 className={styles["spinner"]} />
					) : isPlaying ? (
						<MdOutlinePause />
					) : (
						<MdOutlinePlayArrow />
					)}
				</Button>
				<Button
					onPress={stop}
					isDisabled={!isPlaying && !isPaused && !isLoading} // Enable stop button when playing, paused, or loading
				>
					<MdOutlineStop />
				</Button>
			</div>
		</div>
	)
}
