import { useState, useContext, useEffect } from "react"
import { BackendContext } from "../../../../contexts/backend"
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
import styles from "./backendForm.module.css"
import { BackendClient } from "../../../../clients/backendClient"
import { BackendModalOpenContext } from "../../../../contexts/backendModalOpen"

export default function BackendForm() {
	const backendContext = useContext(BackendContext)

	if (!backendContext) {
		throw new Error("BackendContext is not provided")
	}

	const { backend, setBackend } = backendContext
	const [backendUrl, setBackendUrl] = useState(backend.url)

	const [registrationRequired, setRegistrationRequired] = useState(false)

	const [login, setLogin] = useState("")
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")

	const [tryAgainMessage, setTryAgainMessage] = useState("")

	// Set tryAgain message to login again message if backend authentication is not valid
	useEffect(() => {
		;(async function () {
			if (backend.isSet()) {
				const authValid = await backend.isAuthValid()
				if (!authValid) {
					setTryAgainMessage("Your login has expired, Please login again.")
				}
			}
		})()
	}, [backend])

	const { backendModalOpen, setBackendModalOpen } = useContext(BackendModalOpenContext)

	async function handleSave() {
		setBackend(new BackendClient(backendUrl))
		localStorage.setItem("backend", backendUrl)

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

			const registrationSuccess = await backend.register(login, password)
			if (!registrationSuccess) {
				setTryAgainMessage("Registration failed. Please try again.")
				return
			}
		} else {
			const loginSuccess = await backend.login(login, password)
			if (!loginSuccess) {
				setTryAgainMessage("Login failed. Please try again.")
				return
			}
		}

		const authValid = await backend.isAuthValid()
		if (!authValid) {
			setTryAgainMessage("Authentication failed. Please try again.")
			return
		}

		setTryAgainMessage("")
		setBackendModalOpen(false)
	}

	return (
		<Modal
			isOpen={backendModalOpen}
			onOpenChange={setBackendModalOpen}
		>
			<Dialog>
				<Form>
					<TextField
						value={backendUrl}
						onChange={setBackendUrl}
					>
						<Label>Backend URL</Label>
						<Input />
						<FieldError />
					</TextField>

					{tryAgainMessage && (
						<div className={styles["error-message"]}>{tryAgainMessage}</div>
					)}

					<Switch
						isSelected={registrationRequired}
						onChange={setRegistrationRequired}
					>
						<div className="indicator" />
						<Label>Create account</Label>
					</Switch>

					<TextField
						value={login}
						onChange={setLogin}
					>
						<Label>Login</Label>
						<Input />
						<FieldError />
					</TextField>

					<TextField
						value={password}
						onChange={setPassword}
					>
						<Label>Password</Label>
						<Input type="password" />
						<FieldError />
					</TextField>

					{/* Show confirm password field only if registration is required */}
					{registrationRequired && (
						<TextField
							value={confirmPassword}
							onChange={setConfirmPassword}
						>
							<Label>Confirm Password</Label>
							<Input type="password" />
							<FieldError />
						</TextField>
					)}

					<div className={styles["buttons"]}>
						{/* Save button */}
						<Button
							aria-label="Save"
							className="react-aria-Button blue-button"
							onPress={handleSave}
						>
							<MdOutlineSave />
						</Button>

						{/* Cancel button */}
						<Button
							slot="close"
							aria-label="Cancel"
							className="react-aria-Button red-button"
						>
							<MdOutlineClose />
						</Button>
					</div>
				</Form>
			</Dialog>
		</Modal>
	)
}
