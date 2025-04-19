import { createContext, Dispatch, SetStateAction } from "react"
import { SortBy } from "../enums/booksSortBy"
import { SortConfig } from "../interfaces/sortConfig"

export const SortConfigContext = createContext<{
	sortConfig: SortConfig
	setSortConfig: Dispatch<SetStateAction<SortConfig>>
}>({
	sortConfig: {
		sortBy: SortBy.LastRead,
		desc: false
	},
	setSortConfig: () => {
		throw new Error("SortConfigContext is not provided")
	}
})
