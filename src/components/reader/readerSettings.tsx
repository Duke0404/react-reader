import { Button, Dialog, Heading, Modal, ModalOverlay, Switch } from "react-aria-components"
import { MdOutlineSave } from "react-icons/md"

import styles from "./readerSettings.module.css"

interface props {
	bionicBolding: boolean
	toggleBionicBolding: VoidFunction
}

export default function ReaderSettings({ bionicBolding, toggleBionicBolding }: props) {
	return (
		<ModalOverlay className={styles["overlay"]}>
			<Modal className={styles["modal"]}>
				<Dialog className={styles["dialog"]}>
					{({ close }) => (
						<>
							<Heading>Reader Settings</Heading>

							<div>
								<Heading level={2}>Bionic Bolding</Heading>
								<Switch
									isSelected={bionicBolding}
									onChange={toggleBionicBolding}
								>
									<div className="indicator" />
									Low power mode
								</Switch>
							</div>

							<Button
								onPress={() => {
									close()
								}}
								className="green-button react-aria-Button"
							>
								<MdOutlineSave />
								<span>Save</span>
							</Button>
						</>
					)}
				</Dialog>
			</Modal>
		</ModalOverlay>
	)
}
