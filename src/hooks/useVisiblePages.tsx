import debounce from "lodash/debounce"
import { useEffect, useRef } from "react"

export default function useVisiblePages(
	pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
	onVisiblePagesChange: (firstVisible: number, lastVisible: number) => void
) {
	const debouncedOnVisiblePagesChange = useRef(debounce(onVisiblePagesChange, 150))

	useEffect(() => {
		const currentRefs = pageRefs.current
		if (currentRefs.length === 0) return

		const debouncedFn = debouncedOnVisiblePagesChange.current

		const processEntries = (entries: IntersectionObserverEntry[]) => {
			const visiblePages = entries
				.filter(entry => entry.isIntersecting)
				.map(entry => +(entry.target.getAttribute("data-page-number") as string))
				.sort((a, b) => a - b)

			if (visiblePages.length > 0) {
				const firstVisible = visiblePages[0]
				const lastVisible = visiblePages[visiblePages.length - 1]
				debouncedFn(firstVisible, lastVisible)
			}
		}

		const observer = new IntersectionObserver(
			entries => {
				processEntries(entries)
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
			debouncedFn.cancel()
		}
	}, [pageRefs, onVisiblePagesChange])
}
