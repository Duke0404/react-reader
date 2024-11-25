import { useEffect } from 'react';
import { ReadingDirection } from "../types/readingDirection"
import { useNavigate } from "@tanstack/react-router"

export default function usePageScrollObserver(
        pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>,
        direction: ReadingDirection,
        bookId: number
    ) {
    const navigate = useNavigate()

    useEffect(() => {
		if (direction === ReadingDirection.horizontal || pageRefs.current.length === 0) return

		const observer = new IntersectionObserver(
			(entries) => {

				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const pageNumber = +(entry.target.getAttribute("data-page-number") as string)

						navigate({
							to: `/${bookId}/${pageNumber}`
						})
					}
				})
			},
			{
				threshold: 0.2
			}
		)

		pageRefs.current.forEach((ref) => {
			if (ref) observer.observe(ref)
		})

		return () => {
			pageRefs.current.forEach((ref) => {
				if (ref) observer.unobserve(ref)
			})
		}
	}, [direction, bookId, pageRefs.current.length])
}