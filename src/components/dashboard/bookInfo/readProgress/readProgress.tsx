import { Meter } from "react-aria-components"

import { ProgressInfoType } from "../../../../enums/progressInfoType"
import styles from "./readProgress.module.css"

interface props {
	currentPage: number
	totalPages: number
	progressInfoType: ProgressInfoType
}

export default function ReadProgress({ currentPage, totalPages, progressInfoType }: props) {
	return (
		<Meter
			value={currentPage}
			minValue={1}
			maxValue={totalPages}
			className={styles["read-progress"]}
			aria-label="Book completion level"
		>
			{({ percentage }) => {
				if (totalPages === 1) percentage = 100
				return (
					<>
						<div className={styles["meter"]}>
							<div
								className={styles["fill"]}
								style={{
									width: percentage + "%"
								}}
							/>
						</div>
						<span className={styles["value"]}>
							{progressInfoType === ProgressInfoType.page ? (
								<>
									{currentPage} / {totalPages}
								</>
							) : progressInfoType === ProgressInfoType.percentage ? (
								<>{percentage}%</>
							) : (
								<></>
							)}
						</span>
					</>
				)
			}}
		</Meter>
	)
}
