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
			<MdOutlineHeadphones aria-hidden="true" />
			<div className={styles["controls"]}>
				<Button 
					onPress={handleButtonPress}
					isDisabled={isLoading}
					aria-label={
						isLoading ? "Loading audio..." : 
						isPlaying ? "Pause reading" : 
						isPaused ? "Resume reading" : 
						"Start reading aloud"
					}
				>
					{isLoading ? (
						<ImSpinner8 className={styles["spinner"]} aria-hidden="true" />
					) : isPlaying ? (
						<MdOutlinePause aria-hidden="true" />
					) : (
						<MdOutlinePlayArrow aria-hidden="true" />
					)}
				</Button>
				<Button
					onPress={stop}
					isDisabled={!isPlaying && !isPaused && !isLoading}
					aria-label="Stop reading"
				>
					<MdOutlineStop aria-hidden="true" />
				</Button>
			</div>
		</div>
	)
}
