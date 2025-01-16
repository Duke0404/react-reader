import { Dialog, Modal, Button, Heading, ModalOverlay } from "react-aria-components"
import styles from "./deleteConfirmation.module.css"
import { MdOutlineDeleteForever, MdClose } from "react-icons/md"

interface props {
	title: string
	handleDelete: () => void
	remove: () => void
}

export default function DeleteConfirmation({ title, handleDelete, remove }: props) {
	return (
		<ModalOverlay className={styles["overlay"]}>
			<Modal className={styles["modal"]}>
				<Dialog
					role="alertdialog"
					className={styles["dialog"]}
				>
					{({ close }) => (
						<>
							<Heading>
								Delete <span className="red-text">{title}</span>?
							</Heading>

                            <p>
                                Are you sure you want to permanently delete this book? Corresponding bookmarks and saved preferences will also be removed.
                            </p>

							<div className={styles["action-group"]}>
								<Button
									onPress={() => {
										handleDelete()
										remove()
										close()
									}}
									className="red-button react-aria-Button"
								>
									<MdOutlineDeleteForever />
									<span>Yes, permanently delete</span>
								</Button>
								<Button
									onPress={() => {
										remove()
										close()
									}}
									className="green-button react-aria-Button"
								>
									<MdClose />
									<span>No, don't delete</span>
								</Button>
							</div>
						</>
					)}
				</Dialog>
			</Modal>
		</ModalOverlay>
	)
}
