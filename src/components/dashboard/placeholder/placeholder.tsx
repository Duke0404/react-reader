import { MdOutlineFileUpload } from "react-icons/md"
import styles from "./placeholder.module.css"

export default function Placeholder() {
	return (
		<div className={styles["placeholder"]}>
			<MdOutlineFileUpload className={styles["placeholderImg"]} />
			<p>Drag a book here to get started</p>
		</div>
	)
}
