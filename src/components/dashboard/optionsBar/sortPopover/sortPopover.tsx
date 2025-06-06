import { useContext } from "react"
import { Dialog, Popover, ToggleButton, ToggleButtonGroup } from "react-aria-components"
import {
	MdOutlineAutoStories,
	MdOutlineEvent,
	MdOutlineKeyboardArrowDown,
	MdOutlineKeyboardArrowUp,
	MdOutlinePerson,
	MdOutlineTitle
} from "react-icons/md"

import { SortConfigContext } from "../../../../contexts/sortConfig"
import { SortBy } from "../../../../enums/booksSortBy"

export default function SortPopover() {
	const { sortConfig, setSortConfig } = useContext(SortConfigContext)

	return (
		<Popover>
			<Dialog>
				<span>Sort by</span>

				<ToggleButtonGroup
					orientation="vertical"
					selectedKeys={[sortConfig.sortBy]}
					onSelectionChange={selectedKeys => {
						if (selectedKeys.size === 1) {
							const [selectedKey] = selectedKeys
							if (selectedKey) {
								const sortBy = selectedKey as SortBy
								setSortConfig(prev => ({
									...prev,
									sortBy
								}))
							}
						}
					}}
				>
					<ToggleButton id={SortBy.Title}>
						<MdOutlineTitle />
						<span>Title</span>
					</ToggleButton>

					<ToggleButton id={SortBy.Author}>
						<MdOutlinePerson />
						<span>Author</span>
					</ToggleButton>

					<ToggleButton id={SortBy.LastAdded}>
						<MdOutlineEvent />
						<span>Date added</span>
					</ToggleButton>

					<ToggleButton id={SortBy.LastRead}>
						<MdOutlineAutoStories />
						<span>Last read</span>
					</ToggleButton>
				</ToggleButtonGroup>

				<span>Sort order</span>
				<ToggleButtonGroup
					orientation="vertical"
					selectedKeys={[sortConfig.desc ? "descending" : "ascending"]}
					onSelectionChange={selectedKeys => {
						if (selectedKeys.size === 1) {
							const [selectedKey] = selectedKeys
							if (selectedKey) {
								const desc = selectedKey === "descending"
								setSortConfig(prev => ({
									...prev,
									desc
								}))
							}
						}
					}}
				>
					<ToggleButton id="ascending">
						<MdOutlineKeyboardArrowUp />
						<span>Ascending</span>
					</ToggleButton>

					<ToggleButton id="descending">
						<MdOutlineKeyboardArrowDown />
						<span>Descending</span>
					</ToggleButton>
				</ToggleButtonGroup>
			</Dialog>
		</Popover>
	)
}
