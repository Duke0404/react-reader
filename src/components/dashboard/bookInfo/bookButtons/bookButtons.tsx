import { MdOutlineDelete, MdOutlineEdit } from "react-icons/md"
import { Button, DialogTrigger } from "react-aria-components"

import styles from "./bookButtons.module.css"
import MetadataEditor from "./metadataEditor/metadataEditor"
import DeleteConfirmation from "./deleteConfirmation/deleteConfirmation"

export default function BookButtons() {
	return (
		<div className={styles["container"]}>
			{/* Metadata edit button */}
			<DialogTrigger>
				<Button
					aria-label="Edit"
					className="react-aria-Button subtle-button"
				>
					<MdOutlineEdit />
					<span>Metadata</span>
				</Button>

				{/* Dialog for editing book metadata */}
				<MetadataEditor />
			</DialogTrigger>

			{/* Delete book button */}
			<DialogTrigger>
				<Button
					aria-label="Delete"
					className="react-aria-Button subtle-button red-button"
				>
					<MdOutlineDelete />
				</Button>

				{/* Alert for confirming book deletion */}
				<DeleteConfirmation />
			</DialogTrigger>
		</div>
	)
}
