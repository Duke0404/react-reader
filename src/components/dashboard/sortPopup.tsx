import {
	DialogTrigger,
	Dialog,
	Button,
	Popover,
	OverlayArrow,
	ToggleButtonGroup,
	ToggleButton
} from "react-aria-components"
import { MdSort } from "react-icons/md"
import { useTranslation } from "react-i18next"
import { SortBy } from "../../enums/booksSortBy"
import styles from "./sortPopup.module.css"

interface props {
	handleChangeSortOrder: (order: SortBy) => void
	sortBy: SortBy
}

export default function SortPopup({ handleChangeSortOrder, sortBy }: props) {
	const { t } = useTranslation()

	return (
		<DialogTrigger>
			<Button
				className="react-aria-Button subtle-button"
				aria-label={t("Sort by")}
			>
				<MdSort />
			</Button>
			<Popover>
				<OverlayArrow />
				<Dialog>
					<ToggleButtonGroup
						aria-label="Sort by"
						className={styles["sort-buttons"]}
						selectedKeys={[sortBy]}
						onSelectionChange={keys =>
							handleChangeSortOrder(Array.from(keys)[0] as SortBy)
						}
					>
						<ToggleButton id={SortBy.Title}>{t("Title")}</ToggleButton>
						<ToggleButton id={SortBy.Author}>{t("Author")}</ToggleButton>
						<ToggleButton id={SortBy.LastRead}>{t("Last Read")}</ToggleButton>
						<ToggleButton id={SortBy.LastAdded}>{t("Last Added")}</ToggleButton>
					</ToggleButtonGroup>
				</Dialog>
			</Popover>
		</DialogTrigger>
	)
}
