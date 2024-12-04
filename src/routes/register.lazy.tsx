import { useState, useEffect } from "react"
import { createLazyFileRoute, useNavigate } from "@tanstack/react-router"
import { FieldError, Form, Input, Label, Switch, TextField, Button } from "react-aria-components"
import cryptoJS from "crypto-js"
import styles from "./register.module.css"
import checkRegistration from "../utils/checkRegistration"

export const Route = createLazyFileRoute("/register")({
	component: Register
})

function Register() {
	const navigate = useNavigate()

	useEffect(() => {
		if (checkRegistration()) {
			navigate({ to: "/" })
		}
	}, [navigate])

	const [values, setValues] = useState({
		username: "",
		password: "",
		confirmPassword: "",
		offlineOnly: false
	})

	async function handleSubmit(event: React.FormEvent) {
		event.preventDefault()
		localStorage.setItem("registered", "true")

		if (values.offlineOnly) {
			localStorage.setItem("offlineOnly", "true")
			localStorage.setItem("username", values.username)

			const salt = cryptoJS.lib.WordArray.random(128 / 8)
			const hashedPassword = cryptoJS
				.PBKDF2(values.password, salt, { keySize: 512 / 32, iterations: 1000 })
				.toString()
			localStorage.setItem("password", hashedPassword)
			navigate({ to: "/" })
		}
	}

	return (
		<Form
			id={styles.form}
			onSubmit={handleSubmit}
		>
			<TextField
				className={styles.textField}
				name="username"
				minLength={3}
				maxLength={50}
				pattern="^[a-zA-Z0-9_]+$"
				value={values.username}
				onChange={newVal => setValues({ ...values, username: newVal })}
				isRequired
			>
				<Input placeholder="Username" />
				<FieldError />
			</TextField>

			<TextField
				className={styles.textField}
				name="password"
				type="password"
				minLength={8}
				maxLength={50}
				value={values.password}
				onChange={newVal => setValues({ ...values, password: newVal })}
				isRequired
			>
				<Input placeholder="Password" />
				<FieldError />
			</TextField>

			<TextField
				className={styles.textField}
				name="confrimPassword"
				type="password"
				minLength={8}
				maxLength={50}
				validate={val => (val === values.password ? true : "Passwords do not match")}
				value={values.confirmPassword}
				onChange={newVal => setValues({ ...values, confirmPassword: newVal })}
				isRequired
			>
				<Input placeholder="Confirm Password" />
				<FieldError />
			</TextField>

			<div className={styles.buttonDiv}>
				<Switch
					name="offlineOnly"
					value={values.offlineOnly.toString()}
					onChange={newVal => setValues({ ...values, offlineOnly: newVal })}
				>
					<div className="indicator" />
					<Label
						style={{ textDecoration: values.offlineOnly ? "unset" : "line-through" }}
					>
						Offline mode Only
					</Label>
				</Switch>

				<Button type="submit">Register</Button>
			</div>
		</Form>
	)
}
