import { forwardRef } from "react"
import styles from "./pagePlaceholder.module.css"

interface props {
	width: number
	height: number
	pageNumber: number
}

const PagePlaceholder = forwardRef<HTMLDivElement, props>(({ width, height, pageNumber }, ref) => {
	return (
		<div
			className={styles["placeholder"]}
			style={{ width, height }}
			ref={ref}
			data-page-number={pageNumber}
		/>
	)
})

export default PagePlaceholder
