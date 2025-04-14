// readerContext.tsx
import {
	createContext,
	useCallback,
	useState,
	useReducer,
	useRef
} from "react"
import { ReadingDirection } from "../../enums/readingDirection"

type ReaderContextState = {
	currentPages: [number, number]
	direction: ReadingDirection
	totalPages: number
}

type ReaderContextActions = {
	handleDeltaPage: (delta: number) => void
	toggleDirection: () => void
	updatePages: (pages: [number, number]) => void
}

export const ReaderContext = createContext<(ReaderContextState & ReaderContextActions) | null>(null)

export function ReaderProvider({
	children,
	totalPages
}: {
	children: React.ReactNode
	totalPages: number
}) {
	const [state, setState] = useState<Omit<ReaderContextState, "totalPages">>({
		currentPages: [1, 1],
		direction: ReadingDirection.vertical
	})

	const verticalHandlerRef = useRef<(delta: number) => void>()
	const horizontalHandlerRef = useRef<(delta: number) => void>()

	const toggleDirection = useReducer(
		(prev: ReadingDirection) =>
			prev === ReadingDirection.vertical
				? ReadingDirection.horizontal
				: ReadingDirection.vertical,
		ReadingDirection.vertical
	)[1]

	const handleDeltaPage = useCallback(
		(delta: number) => {
			const handler =
				state.direction === ReadingDirection.vertical
					? verticalHandlerRef.current
					: horizontalHandlerRef.current
			handler?.(delta)
		},
		[state.direction]
	)

	const updatePages = useCallback((pages: [number, number]) => {
		setState(prev => ({ ...prev, currentPages: pages }))
	}, [])

	const value = {
		...state,
		totalPages,
		handleDeltaPage,
		toggleDirection,
		updatePages,
		registerVerticalHandler: (handler: (delta: number) => void) => {
			verticalHandlerRef.current = handler
		},
		registerHorizontalHandler: (handler: (delta: number) => void) => {
			horizontalHandlerRef.current = handler
		}
	}

	return <ReaderContext.Provider value={value}>{children}</ReaderContext.Provider>
}
