import { useContext } from "react"
import {
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

import { BionicConfigContext } from "../../contexts/bionicConfig"
import { ReadingDirectionContext } from "../../contexts/readingDirection"
import { ReadingDirection } from "../../enums/readingDirection"
import styles from "./settingsPane.module.css"

export default function SettingsPane() {
	const { bionicConfig, setBionicConfig } = useContext(BionicConfigContext)
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

				<Switch
					isSelected={bionicConfig.on}
					onChange={() => setBionicConfig({ ...bionicConfig, on: !bionicConfig.on })}
				>
					<div className="indicator" />
					Bionic bolding
				</Switch>

				<Slider
					value={bionicConfig.highlightSize}
					onChange={highlightSize => setBionicConfig({ ...bionicConfig, highlightSize })}
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
					onChange={highlightJump => setBionicConfig({ ...bionicConfig, highlightJump })}
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
			</Form>
		</>
	)
}
