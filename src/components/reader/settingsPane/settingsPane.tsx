import { useContext } from "react"
import {
	Disclosure,
	DisclosurePanel,
	Form,
	Label,
	ListBox,
	ListBoxItem,
	Popover,
	Select,
	SelectValue,
	Switch,
	ToggleButton,
	ToggleButtonGroup,
	Button,
	Dialog,
	Modal,
	ModalOverlay
} from "react-aria-components"
import { MdExpandMore, MdAdd, MdRemove, MdClose } from "react-icons/md"
import { MdOutlineCropPortrait, MdOutlineSplitscreen } from "react-icons/md"

import { ReaderSettingsContext } from "../../../contexts/readerSettings"
import { colorModes } from "../../../data/colorModes"
import { ReadingDirection } from "../../../enums/readingDirection"
import styles from "./settingsPane.module.css"

// Custom ValueSelector component to replace sliders
interface ValueSelectorProps {
	label: string
	value: number
	onChange: (value: number) => void
	min: number
	max: number
	step: number
	disabled?: boolean
}

function ValueSelector({ label, value, onChange, min, max, step, disabled }: ValueSelectorProps) {
	const handleDecrease = () => {
		const newValue = Math.max(min, value - step)
		onChange(newValue)
	}

	const handleIncrease = () => {
		const newValue = Math.min(max, value + step)
		onChange(newValue)
	}

	return (
		<div className={styles.valueSelector}>
			<Label>{label}</Label>
			<div className={styles.valueControls}>
				<Button 
					onPress={handleDecrease} 
					isDisabled={disabled || value <= min}
					className={styles.valueButton}
				>
					<MdRemove />
				</Button>
				<span className={styles.valueDisplay}>{value}</span>
				<Button 
					onPress={handleIncrease} 
					isDisabled={disabled || value >= max}
					className={styles.valueButton}
				>
					<MdAdd />
				</Button>
			</div>
		</div>
	)
}

interface SettingsPaneProps {
	isOpen: boolean
	onOpenChange: () => void
}

export default function SettingsPane({ isOpen, onOpenChange }: SettingsPaneProps) {
	const {
		settings,
		updateBionic,
		updateReadAloud,
		updateTranslation,
		updateReadingDirection,
		updateScale,
		updateColorMode
	} = useContext(ReaderSettingsContext)
	const {
		bionic: bionicConfig,
		readAloud: readAloudConfig,
		translation: translationConfig = { on: false, targetLanguage: "en" },
		readingDirection,
		colorMode: colorModeConfig
	} = settings

	return (
		<ModalOverlay
			isOpen={isOpen}
			onOpenChange={onOpenChange}
			className={styles.modalOverlay}
			isDismissable={false} // Prevent closing when clicking outside
		>
			<Modal className={styles.modal}>
				<Dialog className={styles.dialog}>
					<div className={styles.header}>
						<h2>Settings</h2>
						<Button
							onPress={onOpenChange}
							className={styles.closeButton}
						>
							<MdClose />
						</Button>
					</div>
					<Form className={styles["pane"]}>
						<ToggleButtonGroup
				orientation="vertical"
				aria-label="Reading Direction"
				selectedKeys={[readingDirection]}
				onSelectionChange={selectedKeys => {
					if (selectedKeys.size === 1) {
						const [selectedKey] = selectedKeys
						if (selectedKey) {
							const readinDir = selectedKey as ReadingDirection
							updateReadingDirection(readinDir)
						}
					}
				}}
			>
				<ToggleButton id={ReadingDirection.vertical}>
					<MdOutlineSplitscreen />
					<span>Scrollable</span>
				</ToggleButton>
				<ToggleButton id={ReadingDirection.horizontal}>
					<MdOutlineCropPortrait />
					<span>Single page</span>
				</ToggleButton>
			</ToggleButtonGroup>

			<ValueSelector
				label="Scale"
				value={settings.scale}
				onChange={updateScale}
				min={0.25}
				max={2}
				step={0.25}
			/>

			<Disclosure isExpanded={colorModeConfig.on}>
				<Switch
					isSelected={colorModeConfig.on}
					onChange={() => updateColorMode({ on: !colorModeConfig.on })}
				>
					<div className="indicator" />
					<Label>Color Modes</Label>
				</Switch>

				<DisclosurePanel>
					<ToggleButtonGroup
						orientation="vertical"
						aria-label="Color Modes"
						selectedKeys={[colorModeConfig.mode]}
						onSelectionChange={selectedKeys => {
							if (selectedKeys.size === 1) {
								const [selectedKey] = selectedKeys
								if (selectedKey) {
									updateColorMode({
										mode: selectedKey as keyof typeof colorModes
									})
								}
							}
						}}
					>
						{Object.entries(colorModes).map(([name, { background, text }]) => (
							<ToggleButton
								key={name}
								id={name}
								style={{ backgroundColor: background, color: text }}
								className={`react-aria-ToggleButton ${styles.colorModeButton}`}
							>
								<span>Text</span>
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</DisclosurePanel>
			</Disclosure>

			<Disclosure isExpanded={bionicConfig.on}>
				<Switch
					isSelected={bionicConfig.on}
					onChange={() => updateBionic({ on: !bionicConfig.on })}
				>
					<div className="indicator" />
					<Label>Bionic bolding</Label>
				</Switch>

				<DisclosurePanel>
					<ValueSelector
						label="Highlight Size"
						value={bionicConfig.highlightSize}
						onChange={highlightSize => updateBionic({ highlightSize })}
						min={1}
						max={5}
						step={1}
						disabled={!bionicConfig.on}
					/>

					<ValueSelector
						label="Highlight Jump"
						value={bionicConfig.highlightJump}
						onChange={highlightJump => updateBionic({ highlightJump })}
						min={1}
						max={5}
						step={1}
						disabled={!bionicConfig.on}
					/>

					<ValueSelector
						label="Highlight Multiplier"
						value={bionicConfig.highlightMultiplier}
						onChange={highlightMultiplier => updateBionic({ highlightMultiplier })}
						min={1}
						max={4}
						step={1}
						disabled={!bionicConfig.on}
					/>

					<ValueSelector
						label="Lowlight Opacity"
						value={bionicConfig.lowlightOpacity}
						onChange={lowlightOpacity => updateBionic({ lowlightOpacity })}
						min={0}
						max={1}
						step={0.2}
						disabled={!bionicConfig.on}
					/>
				</DisclosurePanel>
			</Disclosure>

			<Disclosure isExpanded={readAloudConfig.on}>
				<Switch
					isSelected={readAloudConfig.on}
					onChange={() => updateReadAloud({ on: !readAloudConfig.on })}
				>
					<div className="indicator" />
					<Label>Read Aloud (TTS)</Label>
				</Switch>

				<DisclosurePanel>
					<Switch
						isSelected={readAloudConfig.localAlways}
						onChange={() =>
							updateReadAloud({ localAlways: !readAloudConfig.localAlways })
						}
						isDisabled={!readAloudConfig.on}
					>
						<div className="indicator" />
						<Label>Local only</Label>
					</Switch>

					<Switch
						isSelected={readAloudConfig.playFullPage}
						onChange={() =>
							updateReadAloud({ playFullPage: !readAloudConfig.playFullPage })
						}
						isDisabled={!readAloudConfig.on}
					>
						<div className="indicator" />
						<Label>Read full page</Label>
					</Switch>
				</DisclosurePanel>
			</Disclosure>

			<Disclosure isExpanded={translationConfig.on}>
				<Switch
					isSelected={translationConfig.on}
					onChange={() => updateTranslation({ on: !translationConfig.on })}
				>
					<div className="indicator" />
					<Label>Translation</Label>
				</Switch>

				<DisclosurePanel>
					<Select
						selectedKey={translationConfig.targetLanguage}
						onSelectionChange={(key) => updateTranslation({ targetLanguage: key as string })}
						isDisabled={!translationConfig.on}
					>
						<Label>Target Language</Label>
						<Button>
							<SelectValue />
							<MdExpandMore />
						</Button>
						<Popover>
							<ListBox>
								<ListBoxItem id="en">English</ListBoxItem>
								<ListBoxItem id="pl">Polish</ListBoxItem>
								<ListBoxItem id="de">German</ListBoxItem>
								<ListBoxItem id="fr">French</ListBoxItem>
								<ListBoxItem id="es">Spanish</ListBoxItem>
								<ListBoxItem id="it">Italian</ListBoxItem>
								<ListBoxItem id="pt">Portuguese</ListBoxItem>
								<ListBoxItem id="nl">Dutch</ListBoxItem>
							</ListBox>
						</Popover>
					</Select>
				</DisclosurePanel>
			</Disclosure>
					</Form>
				</Dialog>
			</Modal>
		</ModalOverlay>
	)
}
