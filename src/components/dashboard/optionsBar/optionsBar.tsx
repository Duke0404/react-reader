import { DialogTrigger, Button } from "react-aria-components"
import { MdOutlineCloud, MdOutlineCloudOff } from "react-icons/md"
import styles from "./optionsBar.module.css"
import useDarkMode from "../../../hooks/useDarkMode"
import bannerLogoDark from "../../../assets/banner-logo-dark.svg"
import bannerLogoLight from "../../../assets/banner-logo-light.svg"
import { useContext, useEffect, useState } from "react"
import { BackendContext } from "../../../contexts/backend"
import BackendForm from "./backendForm/backendForm"

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

	return (
		<div className={styles["container"]}>
			<img src={darkMode ? bannerLogoDark : bannerLogoLight} />

			<div>
				{/* Backend connection indicator and button */}
				<DialogTrigger>
					<Button className="react-aria-Button subtle-button">
						{isAvailable ? <MdOutlineCloud /> : <MdOutlineCloudOff />}
					</Button>
					<BackendForm />
				</DialogTrigger>
			</div>
		</div>
	)
}
