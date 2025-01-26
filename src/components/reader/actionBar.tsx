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
			>
				<MdOutlineHome />
			</Link>
			<Button onPress={toggleSettings}>
				<MdOutlineSettings />
			</Button>
		</nav>
	)
}
