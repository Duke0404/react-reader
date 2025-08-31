import { useState, useContext, useEffect } from "react"
import { BackendContext } from "../../contexts/backend"
import { SyncContext } from "../../contexts/sync"
import {
	Button,
	Dialog,
	FieldError,
	Form,
	Input,
	Label,
	Modal,
	Switch,
	TextField
} from "react-aria-components"
import { MdOutlineClose, MdOutlineSave } from "react-icons/md"
import styles from "./authModal.module.css"
import { AuthModalContext } from "../../contexts/authModal"
import { BackendClient } from "../../clients/backendClient"

export default function AuthModal() {
	const backendContext = useContext(BackendContext)

	if (!backendContext) {
		throw new Error("BackendContext is not provided")
	}

	const { backend, setBackend } = backendContext
	const { authModalOpen, setAuthModalOpen, authModalMessage } = useContext(AuthModalContext)
	const { syncService } = useContext(SyncContext)

	const [backendUrl, setBackendUrl] = useState(backend.url || "http://localhost:3000")
	const [registrationRequired, setRegistrationRequired] = useState(false)
	const [username, setUsername] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [tryAgainMessage, setTryAgainMessage] = useState("")

	// Set initial message if provided
	useEffect(() => {
		if (authModalMessage) {
			setTryAgainMessage(authModalMessage)
		}
	}, [authModalMessage])

	// Clear form when modal opens
	useEffect(() => {
		if (authModalOpen) {
			setUsername("")
			setPassword("")
			setConfirmPassword("")
			setRegistrationRequired(false)
		}
	}, [authModalOpen])

	async function handleSave() {
		// Update backend URL if changed or being set for the first time
		if (backendUrl && backendUrl !== backend.url) {
			const newBackend = new BackendClient(backendUrl, backend.authFailureCallback)
			setBackend(newBackend)
			localStorage.setItem("backend", backendUrl)
		}

		// Check if backend is accessible
		const isAccessible = await backend.isAccessible()
		if (!isAccessible) {
			setTryAgainMessage("Backend is not accessible. Please check the URL.")
			return
		}

		if (registrationRequired) {
			if (password !== confirmPassword) {
				setTryAgainMessage("Passwords do not match.")
				return
			}

			const registrationSuccess = await backend.register(username, password)
			if (!registrationSuccess) {
				setTryAgainMessage("Registration failed. Username may already exist.")
				return
			}
		} else {
			const loginSuccess = await backend.login(username, password)
			if (!loginSuccess) {
				setTryAgainMessage("Login failed. Please check your credentials.")
				return
			}
		}

		// Verify authentication was successful
		const authValid = await backend.isAuthValid()
		if (!authValid) {
			setTryAgainMessage("Authentication failed. Please try again.")
			return
		}

		// Success - clear messages and close modal
		setTryAgainMessage("")
		setAuthModalOpen(false)
		
		// Trigger sync after successful authentication
		if (syncService) {
			setTimeout(() => {
				console.log("Triggering sync after authentication...")
				syncService.sync()
			}, 500)
		}
	}

	function handleClose() {
		// Only allow closing if backend is not set
		if (!backend.isSet()) {
			return
		}
		setAuthModalOpen(false)
	}

	return (
		<Modal
			isOpen={authModalOpen}
			onOpenChange={handleClose}
			isDismissable={backend.isSet()}
		>
			<Dialog>
				<Form onSubmit={(e) => {
					e.preventDefault()
					handleSave()
				}}>
					<div className={styles.header}>
						<h2>Backend Connection</h2>
						{backend.isSet() && (
							<Button
								className="react-aria-Button subtle-button"
								onPress={handleClose}
							>
								<MdOutlineClose />
							</Button>
						)}
					</div>

					<TextField
						value={backendUrl}
						onChange={setBackendUrl}
						isRequired={!backend.isSet()}
					>
						<Label>Backend URL</Label>
						<Input placeholder="http://localhost:3000" />
						<FieldError />
					</TextField>

					{tryAgainMessage && (
						<div className={styles["error-message"]}>{tryAgainMessage}</div>
					)}

					<div className={styles.switchContainer}>
						<Switch
							isSelected={registrationRequired}
							onChange={setRegistrationRequired}
						>
							<div className="indicator" />
							<Label>Create new account</Label>
						</Switch>
					</div>

					<TextField
						value={username}
						onChange={setUsername}
						isRequired
					>
						<Label>Username</Label>
						<Input autoComplete="username" />
						<FieldError />
					</TextField>

					<TextField
						value={password}
						onChange={setPassword}
						isRequired
					>
						<Label>Password</Label>
						<Input type="password" autoComplete={registrationRequired ? "new-password" : "current-password"} />
						<FieldError />
					</TextField>

					{/* Show confirm password field only if registration is required */}
					{registrationRequired && (
						<TextField
							value={confirmPassword}
							onChange={setConfirmPassword}
							isRequired
						>
							<Label>Confirm Password</Label>
							<Input type="password" autoComplete="new-password" />
							<FieldError />
						</TextField>
					)}

					<div className={styles.actions}>
						<Button
							className="react-aria-Button"
							onPress={handleSave}
							type="submit"
						>
							<MdOutlineSave />
							{registrationRequired ? "Register" : "Login"}
						</Button>
					</div>
				</Form>
			</Dialog>
		</Modal>
	)
}
