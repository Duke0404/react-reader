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

import { BionicConfigContext } from "../../../contexts/bionicConfig"
import { ReadAloudConfigContext } from "../../../contexts/readAloudConfig"
import { ReadingDirectionContext } from "../../../contexts/readingDirection"
import { ReadingDirection } from "../../../enums/readingDirection"
import styles from "./settingsPane.module.css"

export default function SettingsPane() {
	const { bionicConfig, setBionicConfig } = useContext(BionicConfigContext)
	const { readAloudConfig, setReadAloudConfig } = useContext(ReadAloudConfigContext)
	const { readingDirection, setReadingDirection } = useContext(ReadingDirectionContext)

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
								setReadingDirection(readinDir)
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

				<Disclosure isExpanded={bionicConfig.on}>
					<Switch
						isSelected={bionicConfig.on}
						onChange={() => setBionicConfig({ ...bionicConfig, on: !bionicConfig.on })}
					>
						<div className="indicator" />
						<Label>Bionic bolding</Label>
					</Switch>

					<DisclosurePanel>
						<Slider
							value={bionicConfig.highlightSize}
							onChange={highlightSize =>
								setBionicConfig({ ...bionicConfig, highlightSize })
							}
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
							onChange={highlightJump =>
								setBionicConfig({ ...bionicConfig, highlightJump })
							}
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
							onChange={highlightMultiplier =>
								setBionicConfig({ ...bionicConfig, highlightMultiplier })
							}
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
							onChange={lowlightOpacity =>
								setBionicConfig({ ...bionicConfig, lowlightOpacity })
							}
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
						onChange={() =>
							setReadAloudConfig({ ...readAloudConfig, on: !readAloudConfig.on })
						}
					>
						<div className="indicator" />
						<Label>Read Aloud (TTS)</Label>
					</Switch>

					<DisclosurePanel>
						<Switch
							isSelected={readAloudConfig.localAlways}
							onChange={() =>
								setReadAloudConfig({
									...readAloudConfig,
									localAlways: !readAloudConfig.localAlways
								})
							}
							isDisabled={!readAloudConfig.on}
						>
							<div className="indicator" />
							<Label>Local only</Label>
						</Switch>

						<Switch
							isSelected={readAloudConfig.playFullPage}
							onChange={() =>
								setReadAloudConfig({
									...readAloudConfig,
									playFullPage: !readAloudConfig.playFullPage
								})
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
