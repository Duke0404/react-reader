import { createLazyFileRoute, useNavigate } from "@tanstack/react-router"
import Reader from "../components/reader/reader"

export const Route = createLazyFileRoute("/$bookIdParam/$currPageParam")({
	component: ReaderRoute
})

function ReaderRoute() {
	const navigate = useNavigate()
	const { bookIdParam, currPageParam } = Route.useParams()

	// When invalid bookId, navigate to 404
	const bookId = +bookIdParam
	if (isNaN(bookId)) {
		navigate({ to: "/404" })
	}

	// When invalid currPage, navigate to the first page
	const currPage = +currPageParam || 1

	return (
		<Reader
			bookId={bookId}
			initPage={currPage}
		/>
	)
}
