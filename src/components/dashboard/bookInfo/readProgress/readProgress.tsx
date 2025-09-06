import { Meter } from "react-aria-components"

import { ProgressInfoType } from "../../../../enums/progressInfoType"
import styles from "./readProgress.module.css"

interface props {
	lastReadPage: number
	totalPages: number
	progressInfoType: ProgressInfoType
}

export default function ReadProgress({ lastReadPage, totalPages, progressInfoType }: props) {
	return (
		<Meter
			value={lastReadPage}
			minValue={1}
			maxValue={totalPages}
			className={styles["read-progress"]}
			aria-label="Book reading progress"
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
									{lastReadPage} / {totalPages}
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
