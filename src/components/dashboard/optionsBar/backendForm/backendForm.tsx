import { useState } from "react"
import {
	Button,
	Dialog,
	FieldError,
	Form,
	Input,
	Label,
	Modal,
	TextField
} from "react-aria-components"
import { MdOutlineClose, MdOutlineSave } from "react-icons/md"
import styles from "./backendForm.module.css"

export default function BackendForm() {
	const [backendUrl, setBackendUrl] = useState("")

	return (
		<Modal>
			<Dialog>
				<Form>
					<TextField
						value={backendUrl}
						onChange={setBackendUrl}
					>
						<Label>Backend URL</Label>
						<Input />
						<FieldError />
					</TextField>

					<div className={styles["buttons"]}>
						{/* Save button */}
						<Button
							slot="close"
							aria-label="Save"
							className="react-aria-Button blue-button"
						>
							<MdOutlineSave />
						</Button>

						{/* Cancel button */}
						<Button
							slot="close"
							aria-label="Cancel"
							className="react-aria-Button red-button"
						>
							<MdOutlineClose />
						</Button>
					</div>
				</Form>
			</Dialog>
		</Modal>
	)
}
