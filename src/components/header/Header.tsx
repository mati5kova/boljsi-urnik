import { useBoljsiUrnikContext } from "../../context/BoljsiUrnikContext";
import getCurrentSchoolYear from "../../functions/getCurrentSchoolYear";
import EditModeSwitch from "./editmodeswitch/EditModeSwitch";
import "./Header.css";
import SeasonSwitch from "./seasonswitch/SeasonSwitch";
import StudentNumberInput from "./studentnumberinput/StudentNumberInput";
import TimetableReset from "./timetablereset/TimetableReset";

export interface HeaderProps {
	fetchTimetableFromUrnikFRI: (url: string, controller: AbortController) => Promise<void>;
}

export default function Header({ fetchTimetableFromUrnikFRI }: HeaderProps) {
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
			<div className="header-middle">
				<SeasonSwitch />
				<EditModeSwitch />
			</div>
			<div className="header-right-side">
				<StudentNumberInput />
				<TimetableReset fetchTimetableFromUrnikFRI={fetchTimetableFromUrnikFRI} />
			</div>
		</div>
	);
}
