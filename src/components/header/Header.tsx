import { useBoljsiUrnikContext } from "../../context/BoljsiUrnikContext";
import getCurrentSchoolYear from "../../functions/getCurrentSchoolYear";
import "./Header.css";
import SeasonSwitch from "./seasonswitch/SeasonSwitch";
import StudentNumberInput from "./studentnumberinput/StudentNumberInput";

export default function Header() {
	const schoolYear = getCurrentSchoolYear();

	const { urnikFriSeasonalPartOfUrl, studentNumber } = useBoljsiUrnikContext();

	return (
		<div className="header">
			<div>
				<span className="title">
					{`FRI ${schoolYear[0]}/${schoolYear[1]}, ${urnikFriSeasonalPartOfUrl} semester`}
				</span>
				<br />
				<span>{studentNumber}</span>
			</div>
			<span className="header-right-side">
				<SeasonSwitch />
				<StudentNumberInput />
			</span>
		</div>
	);
}
