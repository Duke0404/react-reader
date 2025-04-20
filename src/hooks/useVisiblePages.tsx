import { useEffect } from "react"
import debounce from "lodash/debounce"

export default function useVisiblePages(
	pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
	onVisiblePagesChange: (firstVisible: number, lastVisible: number) => void
) {
	useEffect(() => {
		const currentRefs = pageRefs.current
		if (currentRefs.length === 0) return

		// Debounce the processing of visible pages
		const debouncedProcessEntries = debounce((entries: IntersectionObserverEntry[]) => {
			const visiblePages = entries
				.filter(entry => entry.isIntersecting)
				.map(entry => +(entry.target.getAttribute("data-page-number") as string))
				.sort((a, b) => a - b)

			if (visiblePages.length > 0) {
				const firstVisible = visiblePages[0]
				const lastVisible = visiblePages[visiblePages.length - 1]
				onVisiblePagesChange(firstVisible, lastVisible)
			}
		}, 100) // Wait until 1s after scrolling stops

		const observer = new IntersectionObserver(
			entries => {
				debouncedProcessEntries(entries)
			},
			{ threshold: 0.25 }
		)

		currentRefs.forEach(ref => {
			if (ref) observer.observe(ref)
		})

		return () => {
			currentRefs.forEach(ref => {
				if (ref) observer.unobserve(ref)
			})
			observer.disconnect()
			debouncedProcessEntries.cancel()
		}
	}, [pageRefs, onVisiblePagesChange])
}
