import {
	DialogTrigger,
	Button,
	Popover,
	OverlayArrow,
	Dialog,
	ToggleButtonGroup
} from "react-aria-components"
import { MdOutlineCloud, MdOutlineCloudOff, MdOutlineSort } from "react-icons/md"
import styles from "./optionsBar.module.css"
import useDarkMode from "../../../hooks/useDarkMode"
import bannerLogoDark from "../../../assets/banner-logo-dark.svg"
import bannerLogoLight from "../../../assets/banner-logo-light.svg"
import { useContext, useEffect, useState } from "react"
import { BackendContext } from "../../../contexts/backend"
import BackendForm from "./backendForm/backendForm"
import { BackendModalOpenContext } from "../../../contexts/backendModalOpen"

export default function OptionsBar() {
	const darkMode = useDarkMode()
	const backendContext = useContext(BackendContext)
	const backend = backendContext?.backend

	const [isAvailable, setIsAvailable] = useState(false)

	// Check if the backend is available
	useEffect(() => {
		if (!backend) {
			setIsAvailable(false)
			return
		}

		// Check if the backend is accessible every second
		const interval = setInterval(async function () {
			const available = await backend.isAccessible()
			setIsAvailable(available)
		}, 1000)

		return () => clearInterval(interval)
	}, [backend])

	const { setBackendModalOpen } = useContext(BackendModalOpenContext)

	return (
		<div className={styles["container"]}>
			<img src={darkMode ? bannerLogoDark : bannerLogoLight} />

			<div>
				{/* Backend connection indicator and button */}
				<DialogTrigger>
					<Button
						className="react-aria-Button subtle-button"
						onPress={() => setBackendModalOpen(true)}
					>
						{isAvailable ? <MdOutlineCloud /> : <MdOutlineCloudOff />}
					</Button>
					<BackendForm />
				</DialogTrigger>

				{/* Sort popover */}
				<DialogTrigger>
					<Button className="react-aria-Button subtle-button">
						<MdOutlineSort />
					</Button>

					<Popover>
						<OverlayArrow />
						<Dialog>
							<span>Sort basis</span>

							<ToggleButtonGroup className="react-aria-ToggleButtonGroup vertical">
								<Button>
									<span>Name</span>
								</Button>
								<Button>
									<span>Date added</span>
								</Button>
								<Button>
									<span>Last read</span>
								</Button>
							</ToggleButtonGroup>

							<span>Sort order</span>
							<ToggleButtonGroup className="react-aria-ToggleButtonGroup vertical">
								<Button>
									<span>Ascending</span>
								</Button>
								<Button>
									<span>Descending</span>
								</Button>
							</ToggleButtonGroup>
						</Dialog>
					</Popover>
				</DialogTrigger>
			</div>
		</div>
	)
}
