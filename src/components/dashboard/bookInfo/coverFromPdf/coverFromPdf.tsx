import { useState, useEffect, useRef } from "react"
import { Page, Document } from "react-pdf"

import styles from "./coverFromPdf.module.css"

export default function CoverFromPdf({ pdf }: { pdf: Blob }) {
	// Reference to the the top level div
	const topRef = useRef<HTMLDivElement>(null)

	// Width of the cover
	const [coverWidth, setCoverWidth] = useState(0)

	// Set the width of the cover when the component mounts
	useEffect(() => {
		if (topRef.current) {
			const { width } = topRef.current.getBoundingClientRect()
			setCoverWidth(width)
		}
	}, [])

	return (
		<div
			className={styles["crop-layer"]}
			ref={topRef}
		>
			<Document file={pdf}>
				<Page
					pageNumber={1}
					renderAnnotationLayer={false}
					renderTextLayer={false}
					width={coverWidth}
				/>
			</Document>
		</div>
	)
}
