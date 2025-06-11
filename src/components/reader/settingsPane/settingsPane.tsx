import { useContext } from "react"
import {
	Disclosure,
	DisclosurePanel,
	Form,
	Label,
	Slider,
	SliderOutput,
	SliderThumb,
	SliderTrack,
	Switch,
	ToggleButton,
	ToggleButtonGroup
} from "react-aria-components"
import { MdOutlineKeyboardDoubleArrowDown, MdOutlineKeyboardDoubleArrowRight } from "react-icons/md"

import { ReaderSettingsContext } from "../../../contexts/readerSettings"
import { ReadingDirection } from "../../../enums/readingDirection"
import styles from "./settingsPane.module.css"

export default function SettingsPane() {
	const { settings, updateBionic, updateReadAloud, updateReadingDirection, updateScale } =
		useContext(ReaderSettingsContext)
	const { bionic: bionicConfig, readAloud: readAloudConfig, readingDirection } = settings

	return (
		<>
			<Form className={styles["pane"]}>
				<Label id="reading-direction">Reading Direction</Label>
				<ToggleButtonGroup
					orientation="horizontal"
					aria-labelledby="reading-direction"
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
						<MdOutlineKeyboardDoubleArrowDown />
						<span>Vertical</span>
					</ToggleButton>
					<ToggleButton id={ReadingDirection.horizontal}>
						<MdOutlineKeyboardDoubleArrowRight />
						<span>Horizontal</span>
					</ToggleButton>
				</ToggleButtonGroup>

				<Slider
					value={settings.scale}
					onChange={updateScale}
					minValue={0.25}
					maxValue={2}
					step={0.25}
				>
					<Label>Scale</Label>
					<SliderOutput />
					<SliderTrack>
						<SliderThumb />
					</SliderTrack>
				</Slider>

				<Disclosure isExpanded={bionicConfig.on}>
					<Switch
						isSelected={bionicConfig.on}
						onChange={() => updateBionic({ on: !bionicConfig.on })}
					>
						<div className="indicator" />
						<Label>Bionic bolding</Label>
					</Switch>

					<DisclosurePanel>
						<Slider
							value={bionicConfig.highlightSize}
							onChange={highlightSize => updateBionic({ highlightSize })}
							minValue={1}
							maxValue={5}
							isDisabled={!bionicConfig.on}
						>
							<Label>Highlight Size</Label>
							<SliderOutput />
							<SliderTrack>
								<SliderThumb />
							</SliderTrack>
						</Slider>

						<Slider
							value={bionicConfig.highlightJump}
							onChange={highlightJump => updateBionic({ highlightJump })}
							minValue={1}
							maxValue={5}
							isDisabled={!bionicConfig.on}
						>
							<Label>Highlight Jump</Label>
							<SliderOutput />
							<SliderTrack>
								<SliderThumb />
							</SliderTrack>
						</Slider>

						<Slider
							value={bionicConfig.highlightMultiplier}
							onChange={highlightMultiplier => updateBionic({ highlightMultiplier })}
							minValue={1}
							maxValue={4}
							isDisabled={!bionicConfig.on}
						>
							<Label>Highlight Multiplier</Label>
							<SliderOutput />
							<SliderTrack>
								<SliderThumb />
							</SliderTrack>
						</Slider>

						<Slider
							value={bionicConfig.lowlightOpacity}
							onChange={lowlightOpacity => updateBionic({ lowlightOpacity })}
							minValue={0}
							maxValue={1}
							step={0.2}
							isDisabled={!bionicConfig.on}
						>
							<Label>Lowlight Opacity</Label>
							<SliderOutput />
							<SliderTrack>
								<SliderThumb />
							</SliderTrack>
						</Slider>
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
			</Form>
		</>
	)
}
