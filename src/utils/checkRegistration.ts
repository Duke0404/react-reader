export default function checkRegistration() {
	return localStorage.getItem("registered") === "true"
}