import { useEffect } from "react"
import { ReadingDirection } from "../types/readingDirection"
import { useNavigate } from "@tanstack/react-router"

export default function usePageScrollObserver(
	pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
	direction: ReadingDirection,
	bookId: number,
	loading: boolean
) {
	const navigate = useNavigate()

	useEffect(() => {
		if (direction === ReadingDirection.horizontal || loading) return

		const currentRefs = pageRefs.current

		if (currentRefs.length === 0) return

		const observer = new IntersectionObserver(
			entries => {
				const intersectingEntries = entries.filter(entry => entry.isIntersecting)
				if (intersectingEntries.length > 0) {
					const pageNumber = +(intersectingEntries[
						intersectingEntries.length - 1
					].target.getAttribute("data-page-number") as string)
					navigate({
						to: `/${bookId}/${pageNumber}`
					})
				}
			},
			{
				threshold: 0.5
			}
		)

		currentRefs.forEach(ref => {
			if (ref) observer.observe(ref)
		})

		return () => {
			currentRefs.forEach(ref => {
				if (ref) observer.unobserve(ref)
			})
		}
	}, [direction, bookId, navigate, pageRefs, loading])
}
