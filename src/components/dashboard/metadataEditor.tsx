import {
	Button,
	TextField,
	Form,
	Input,
	Label,
	FieldError,
	DropZone,
	FileTrigger
} from "react-aria-components"
import { MdAdd, MdClose, MdOutlineImage, MdOutlineSave } from "react-icons/md"
import styles from "./metadataEditor.module.css"
import { useState } from "react"

interface props {
	title: string
	setTitle: (title: string) => void
	author?: string
	setAuthor: (author?: string) => void
	cover?: Blob
	setCover: (cover?: Blob) => void
	cancelMetaEdit: () => void
	saveMetaEdit: () => void
}

export default function MetadataEditor({
	title,
	setTitle,
	author,
	setAuthor,
	cover,
	setCover,
	cancelMetaEdit,
	saveMetaEdit
}: props) {
	const [coverUploaded, setCoverUploaded] = useState(false)

	function handleCoverUpload(files: FileList | null) {
		if (!files) return

		console.log(files[0])

		const file = files[0]
		if (!file) return

		setCover(file)
		setCoverUploaded(true)

		console.log(coverUploaded)
		console.log(cover)
	}

	return (
		<Form className={styles["form"]}>
			<TextField
				name="book-title"
				maxLength={30}
				onInput={e => setTitle(e.currentTarget.value)}
				value={title}
			>
				<Label>Title</Label>
				<Input />
				<FieldError />
			</TextField>
			<TextField
				name="book-author"
				maxLength={30}
				onInput={e => setAuthor(e.currentTarget.value || undefined)}
				value={author}
			>
				<Label>Author</Label>
				<Input />
				<FieldError />
			</TextField>
			<DropZone className={styles["cover-drop"]}>
				<FileTrigger
					acceptedFileTypes={["image/png", "image/jpeg", "image/jpg", "image/webp"]}
					onSelect={handleCoverUpload}
				>
					<Label>Cover</Label>
					<Button className={styles["cover-change-button"]}>
						{coverUploaded && cover ? (
							<>
								<MdOutlineImage />
								<span>Cover image selected</span>
							</>
						) : (
							<>
								<MdAdd className={styles["cover-change-icon"]} />
								<span>Change cover image</span>
							</>
						)}
					</Button>
				</FileTrigger>
			</DropZone>
			<div className={styles["button-group"]}>
				<Button
					onPress={cancelMetaEdit}
					className="red-button react-aria-Button"
				>
					<MdClose />
					<span>Cancel</span>
				</Button>
				<Button
					onPress={saveMetaEdit}
					className="blue-button react-aria-Button"
				>
					<MdOutlineSave />
					<span>Save</span>
				</Button>
			</div>
		</Form>
	)
}
