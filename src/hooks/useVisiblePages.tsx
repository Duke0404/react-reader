import { useEffect } from "react"
import throttle from "lodash/throttle"

export default function useVisiblePages(
	pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
	onVisiblePagesChange: (firstVisible: number, lastVisible: number) => void
) {
	useEffect(() => {
		const currentRefs = pageRefs.current

		if (currentRefs.length === 0) return

		// Throttle the processing of visible pages
		const throttledProcessEntries = throttle((entries: IntersectionObserverEntry[]) => {
			const visiblePages = entries
				.filter(entry => entry.isIntersecting)
				.map(entry => +(entry.target.getAttribute("data-page-number") as string))
				.sort((a, b) => a - b)

			if (visiblePages.length > 0) {
				const firstVisible = visiblePages[0]
				const lastVisible = visiblePages[visiblePages.length - 1]
				onVisiblePagesChange(firstVisible, lastVisible)
			}
		}, 1000) // Throttle to once per second

		const observer = new IntersectionObserver(
			entries => {
				throttledProcessEntries(entries)
			},
			{
				threshold: 0.25
			}
		)

		// Observe each page reference
		currentRefs.forEach(ref => {
			if (ref) observer.observe(ref)
		})

		return () => {
			// Cleanup
			currentRefs.forEach(ref => {
				if (ref) observer.unobserve(ref)
			})
			observer.disconnect()
			throttledProcessEntries.cancel()
		}
	}, [pageRefs, onVisiblePagesChange])
}
