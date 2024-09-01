export default function darkmode() {
	return matchMedia && matchMedia("(prefers-color-scheme: dark)").matches
}
