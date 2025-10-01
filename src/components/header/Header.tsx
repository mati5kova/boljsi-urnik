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

	const { urnikFriSeasonalPartOfUrl, studentNumber, isViewingASharedTimetable } = useBoljsiUrnikContext();

	return (
		<header className="header">
			<div className="header-left">
				<span className="title">
					{`FRI ${schoolYear[0]}/${schoolYear[1]}, ${urnikFriSeasonalPartOfUrl} semester`}
				</span>
				{!isViewingASharedTimetable ? <span>{studentNumber}</span> : <span>Viewing a shared timetable</span>}
			</div>

			{!isViewingASharedTimetable && (
				<>
					<div className="header-controls">
						<SeasonSwitch />
						<EditModeSwitch />
					</div>

					<div className="header-actions">
						<StudentNumberInput />
						<TimetableReset fetchTimetableFromUrnikFRI={fetchTimetableFromUrnikFRI} />
					</div>
				</>
			)}
		</header>
	);
}
