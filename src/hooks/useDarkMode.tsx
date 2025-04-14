import { useEffect, useState } from "react"

export default function useDarkMode() {
	const [darkMode, setDarkMode] = useState(false)

	useEffect(() => {
		const darkModeMediaQuery = matchMedia("(prefers-color-scheme: dark)")
		setDarkMode(darkModeMediaQuery.matches)

		function handleChange(event: MediaQueryListEvent) {
			setDarkMode(event.matches)
		}

		darkModeMediaQuery.addEventListener("change", handleChange)

		return () => {
			darkModeMediaQuery.removeEventListener("change", handleChange)
		}
	}, [])

	return darkMode
}
