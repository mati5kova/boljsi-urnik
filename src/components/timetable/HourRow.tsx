import "./Timetable.css";

interface HourRow {
	i: number;
	time: string;
}

export default function HourRow({ i, time }: HourRow) {
	return (
		<>
			<div className="grid-hour" style={{ gridRow: `${i}` }}>
				{time}
			</div>
			<div className="grid-complete-row" style={{ gridRow: `${i} / span 1` }}></div>
		</>
	);
}
