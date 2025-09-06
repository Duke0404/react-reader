import { Button, Link } from "react-aria-components"
import { MdOutlineHome, MdOutlineSettings } from "react-icons/md"

import styles from "./actionBar.module.css"

interface props {
	toggleSettings: VoidFunction
}

export default function ActionBar({ toggleSettings }: props) {
	return (
		<nav className={styles["bar"]}>
			<Link
				className="react-aria-Button"
				href="/"
				aria-label="Return to library"
			>
				<MdOutlineHome aria-hidden="true" />
			</Link>
			<Button 
				onPress={toggleSettings}
				aria-label="Open reader settings"
			>
				<MdOutlineSettings aria-hidden="true" />
			</Button>
		</nav>
	)
}
