import {
	Form,
	Label,
	Slider,
	SliderOutput,
	SliderThumb,
	SliderTrack,
	Switch
} from "react-aria-components"

import BionicSettings from "../../enums/bionicSettings"
import styles from "./settingsPane.module.css"

interface props {
	bionicSettings: BionicSettings
	setBionicSettings: (bionicSettings: BionicSettings) => void
}
export default function SettingsPane({ bionicSettings, setBionicSettings }: props) {
	return (
		<>
			<Form className={styles["pane"]}>
				<Switch
					isSelected={bionicSettings.on}
					onChange={() =>
						setBionicSettings({ ...bionicSettings, on: !bionicSettings.on })
					}
				>
					<div className="indicator" />
					Bionic bolding
				</Switch>

				<Slider
					value={bionicSettings.highlightSize}
					onChange={highlightSize =>
						setBionicSettings({ ...bionicSettings, highlightSize })
					}
					minValue={1}
					maxValue={5}
					isDisabled={!bionicSettings.on}
				>
					<Label>Highlight Size</Label>
					<SliderOutput />
					<SliderTrack>
						<SliderThumb />
					</SliderTrack>
				</Slider>

				<Slider
					value={bionicSettings.highlightJump}
					onChange={highlightJump =>
						setBionicSettings({ ...bionicSettings, highlightJump })
					}
					minValue={1}
					maxValue={5}
					isDisabled={!bionicSettings.on}
				>
					<Label>Highlight Jump</Label>
					<SliderOutput />
					<SliderTrack>
						<SliderThumb />
					</SliderTrack>
				</Slider>

				<Slider
					value={bionicSettings.highlightMultiplier}
					onChange={highlightMultiplier =>
						setBionicSettings({ ...bionicSettings, highlightMultiplier })
					}
					minValue={1}
					maxValue={4}
					isDisabled={!bionicSettings.on}
				>
					<Label>Highlight Multiplier</Label>
					<SliderOutput />
					<SliderTrack>
						<SliderThumb />
					</SliderTrack>
				</Slider>

				<Slider
					value={bionicSettings.lowlightOpacity}
					onChange={lowlightOpacity =>
						setBionicSettings({ ...bionicSettings, lowlightOpacity })
					}
					minValue={0}
					maxValue={0.8}
					step={0.2}
					isDisabled={!bionicSettings.on}
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
