import {
	Form,
	Label,
	Slider,
	SliderOutput,
	SliderThumb,
	SliderTrack,
	Switch
} from "react-aria-components"
import { BionicConfigContext } from "../../contexts/bionicConfig"
import styles from "./settingsPane.module.css"
import { useContext } from "react"

export default function SettingsPane() {
	const { bionicConfig, setBionicConfig } = useContext(BionicConfigContext)

	return (
		<>
			<Form className={styles["pane"]}>
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
