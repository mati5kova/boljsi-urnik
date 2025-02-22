import Lecture from "./Lecture";
import "./Timetable.css";

interface DayColumn {
	i: number;
	name: string;
	gridAreaName: string;
}

export default function DayColumn({ i, name, gridAreaName }: DayColumn) {
	return (
		<>
			<div className="grid-day" style={{ gridColumn: `${i}` }}>
				{name}
			</div>
			<div className="grid-day-column" style={{ gridArea: `${gridAreaName}` }}>
				<Lecture />
			</div>
		</>
	);
}
