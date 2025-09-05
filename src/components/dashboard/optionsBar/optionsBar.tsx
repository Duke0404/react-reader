import {
	DialogTrigger,
	Button,
} from "react-aria-components"
import { MdOutlineCloud, MdOutlineCloudOff, MdOutlineSort, MdSync } from "react-icons/md"
import styles from "./optionsBar.module.css"
import useDarkMode from "../../../hooks/useDarkMode"
import bannerLogoDark from "../../../assets/banner-logo-dark.svg"
import bannerLogoLight from "../../../assets/banner-logo-light.svg"
import { useContext, useEffect, useState } from "react"
import { BackendContext } from "../../../contexts/backend"
import { AuthModalContext } from "../../../contexts/authModal"
import { SyncContext } from "../../../contexts/sync"
import SortPopover from "./sortPopover/sortPopover"

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

		let checkInterval = 5000 // Start with 5 seconds
		let intervalId: NodeJS.Timeout

		const checkBackend = async () => {
			const available = await backend.isAccessible()
			setIsAvailable(available)
			
			// If offline, check less frequently (30 seconds)
			// If online, check more frequently (5 seconds)
			const newInterval = available ? 5000 : 30000
			if (newInterval !== checkInterval) {
				checkInterval = newInterval
				clearInterval(intervalId)
				intervalId = setInterval(checkBackend, checkInterval)
			}
		}

		// Initial check
		checkBackend()
		
		// Start interval
		intervalId = setInterval(checkBackend, checkInterval)

		return () => clearInterval(intervalId)
	}, [backend])

	const { setAuthModalOpen, setAuthModalMessage } = useContext(AuthModalContext)
	const { syncService, syncStatus } = useContext(SyncContext)
	const [isManualSyncing, setIsManualSyncing] = useState(false)

	function handleBackendClick() {
		if (!backend?.isSet()) {
			setAuthModalMessage?.("Please configure your backend connection.")
		} else if (!isAvailable) {
			setAuthModalMessage?.("Backend is not accessible. Please check your connection.")
		} else {
			setAuthModalMessage?.("")
		}
		setAuthModalOpen(true)
	}
	
	async function handleManualSync() {
		if (!syncService) return
		
		setIsManualSyncing(true)
		const result = await syncService.sync()
		console.log("Manual sync result:", result)
		
		// Show result briefly
		setTimeout(() => {
			setIsManualSyncing(false)
		}, 1000)
	}

	return (
		<div className={styles["container"]}>
			<img alt="React Reader" src={darkMode ? bannerLogoDark : bannerLogoLight} width={146} height={47} />

			<div className={styles["options"]}>
				{/* Backend connection indicator and button */}
				<Button
					className="react-aria-Button subtle-button"
					onPress={handleBackendClick}
					aria-label="Backend connection"
				>
					{isAvailable ? <MdOutlineCloud /> : <MdOutlineCloudOff />}
				</Button>
				
				{/* Manual sync button */}
				{isAvailable && backend?.isSet() && (
					<Button
						className={`react-aria-Button subtle-button ${isManualSyncing || syncStatus === "syncing" ? styles.spinning : ""}`}
						onPress={handleManualSync}
						aria-label="Sync library"
						isDisabled={syncStatus === "syncing"}
					>
						<MdSync />
					</Button>
				)}

				{/* Sort popover */}
				<DialogTrigger>
					<Button className="react-aria-Button subtle-button">
						<MdOutlineSort />
					</Button>

					<SortPopover />
				</DialogTrigger>
			</div>
		</div>
	)
}
