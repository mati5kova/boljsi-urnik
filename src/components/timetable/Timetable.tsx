import { dnevi, ure } from "../../constants/Constants";
import Share from "../share/Share";
import DayColumn from "./DayColumn";
import HourRow from "./HourRow";
import "./Timetable.css";

export default function Timetable() {
	return (
		<>
			<div className="grid-container">
				<div className="grid-outer">
					{Object.keys(dnevi).map((dan, i) => {
						return <DayColumn key={i} i={i + 2} nameOfDay={dan} gridAreaName={dnevi[dan]} />;
					})}
					{ure.map((ura, i) => {
						return <HourRow key={i} i={i + 2} time={ura} />;
					})}
				</div>
			</div>
			<div className="share-section">
				<Share />
			</div>
		</>
	);
}
