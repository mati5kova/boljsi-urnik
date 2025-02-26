import { useBoljsiUrnikContext } from "../../context/BoljsiUrnikContext";
import Lecture from "./individuallecture/Lecture";
import "./Timetable.css";

interface DayColumn {
	i: number;
	nameOfDay: string;
	gridAreaName: string;
}

export default function DayColumn({ i, nameOfDay, gridAreaName }: DayColumn) {
	const { lecturesAuditoryAndLaboratoryExcersises } = useBoljsiUrnikContext();

	return (
		<>
			<div className="grid-day" style={{ gridColumn: `${i}` }}>
				{nameOfDay}
			</div>
			<div className="grid-day-column" style={{ gridArea: gridAreaName }}>
				{[
					...lecturesAuditoryAndLaboratoryExcersises.lecturesP,
					...lecturesAuditoryAndLaboratoryExcersises.lecturesAV,
					...lecturesAuditoryAndLaboratoryExcersises.lecturesLV,
				]
					.filter((laale) => laale.gridArea === gridAreaName)
					.map((laale) => (
						<Lecture key={laale.lectureName} {...laale} />
					))}
			</div>
		</>
	);
}
