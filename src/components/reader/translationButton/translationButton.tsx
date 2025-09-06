import { useContext, useState } from "react"
import { Button, Dialog, Modal, ModalOverlay } from "react-aria-components"
import { MdOutlineTranslate, MdClose } from "react-icons/md"

import { BackendContext } from "../../../contexts/backend"
import { ReaderSettingsContext } from "../../../contexts/readerSettings"
import styles from "./translationButton.module.css"

interface Props {
	pageRef: HTMLDivElement | null
}

export default function TranslationButton({ pageRef }: Props) {
	const { backend } = useContext(BackendContext)
	const { settings } = useContext(ReaderSettingsContext)
	const [translatedText, setTranslatedText] = useState<string>("")
	const [isLoading, setIsLoading] = useState(false)
	const [isModalOpen, setIsModalOpen] = useState(false)

	const isEnabled = settings.translation.on && backend.isSet()

	const handleTranslate = async () => {
		if (!pageRef || !isEnabled) return

		setIsLoading(true)
		
		try {
			// Extract text from the page
			let textContent = ""
			pageRef.querySelectorAll("span").forEach(span => {
				if (span.textContent) {
					textContent += span.textContent.trim() + " "
				}
			})

			const text = textContent.trim()
			if (!text) {
				setTranslatedText("No text found to translate.")
				setIsModalOpen(true)
				return
			}

			// Check if backend is accessible and user is authenticated
			const isAccessible = await backend.isAccessible()
			const isAuthValid = await backend.isAuthValid()
			
			if (!isAccessible || isAuthValid !== true) {
				setTranslatedText("Translation service unavailable. Please check your backend connection and authentication.")
				setIsModalOpen(true)
				return
			}

			// Translate the text
			const result = await backend.translate(text, settings.translation.targetLanguage)
			
			if (result) {
				setTranslatedText(result)
				setIsModalOpen(true)
			} else {
				setTranslatedText("Translation failed. Please try again.")
				setIsModalOpen(true)
			}
		} catch (error) {
			console.error("Translation error:", error)
			setTranslatedText("Translation failed. Please try again.")
			setIsModalOpen(true)
		} finally {
			setIsLoading(false)
		}
	}

	if (!isEnabled) {
		return null
	}

	return (
		<>
			<div className={styles.container}>
				<Button
					onPress={handleTranslate}
					isDisabled={isLoading}
				>
					<MdOutlineTranslate aria-hidden="true" />
					<span>{isLoading ? "Translating..." : "Translate"}</span>
				</Button>
			</div>

			<ModalOverlay
				isOpen={isModalOpen}
				onOpenChange={setIsModalOpen}
				className={styles.modalOverlay}
			>
				<Modal className={styles.modal}>
					<Dialog className={styles.dialog}>
						<div className={styles.header}>
							<h2>Translation</h2>
							<Button
								onPress={() => setIsModalOpen(false)}
								className={styles.closeButton}
							>
								<MdClose />
							</Button>
						</div>
						<div className={styles.content}>
							<p>{translatedText}</p>
						</div>
					</Dialog>
				</Modal>
			</ModalOverlay>
		</>
	)
}
