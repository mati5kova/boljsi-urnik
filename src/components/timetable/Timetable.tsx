import DayColumn from "./DayColumn";
import HourRow from "./HourRow";
import "./Timetable.css";

const dnevi: { [key: string]: string } = {
	pondeljek: "dayMON",
	torek: "dayTUE",
	sreda: "dayWED",
	četrtek: "dayTHU",
	petek: "dayFRI",
};
const ure: string[] = [
	"07:00",
	"08:00",
	"09:00",
	"10:00",
	"11:00",
	"12:00",
	"13:00",
	"14:00",
	"15:00",
	"16:00",
	"17:00",
	"18:00",
	"19:00",
	"20:00",
	"21:00",
];

export default function Timetable() {
	return (
		<div className="grid-container">
			<div className="grid-outer">
				{Object.keys(dnevi).map((dan, i) => {
					return <DayColumn key={i} i={i + 2} name={dan} gridAreaName={dnevi[dan]}></DayColumn>;
				})}
				{ure.map((ura, i) => {
					return <HourRow key={i} i={i + 2} time={ura} />;
				})}
			</div>
		</div>
	);
}
