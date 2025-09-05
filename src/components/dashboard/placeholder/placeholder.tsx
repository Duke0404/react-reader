import { MdOutlineFileUpload } from "react-icons/md"
import styles from "./placeholder.module.css"

export default function Placeholder() {
	return (
		<div className={styles["placeholder"]} role="status" aria-label="No books in library">
			<MdOutlineFileUpload className={styles["placeholderImg"]} aria-hidden="true" />
			<p>Drag a book here to get started</p>
		</div>
	)
}
