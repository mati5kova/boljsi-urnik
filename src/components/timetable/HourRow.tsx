import { useBoljsiUrnikContext } from "../../context/BoljsiUrnikContext";
import "./Timetable.css";

interface HourRow {
	i: number;
	time: string;
}

export default function HourRow({ i, time }: HourRow) {
	const {
		setTemporaryAuditoryAndLaboratoryExcersises,
		inEditMode,
		temporaryAuditoryAndLaboratoryExcersises,
		setLockedLectureKey,
	} = useBoljsiUrnikContext();

	return (
		<>
			<div className="grid-hour" style={{ gridRow: `${i}` }}>
				{time}
			</div>
			<div
				className="grid-complete-row"
				style={{ gridRow: `${i} / span 1` }}
				// za clearanje tempa
				onClick={(e) => {
					// potreben check drugače onClick šteje tudi če pritisnemo Lecture.tsx
					// hočemo da ko pritisnemo na belo ozadje IN smo inEditMode IN temp != null -> clearamo temp
					// po gašperjevem predlogu
					if (
						e.target === e.currentTarget &&
						inEditMode &&
						temporaryAuditoryAndLaboratoryExcersises !== null
					) {
						setTemporaryAuditoryAndLaboratoryExcersises(null);
						setLockedLectureKey(null);
					}
				}}
			></div>
		</>
	);
}
