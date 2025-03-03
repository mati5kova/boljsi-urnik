import { useBoljsiUrnikContext } from "../../../context/BoljsiUrnikContext";
import getUrnikFriUrl from "../../../functions/getUrnikFriUrl";
import { HeaderProps } from "../Header";
import "./TimetableRest.css";

export default function TimetableReset({ fetchTimetableFromUrnikFRI }: HeaderProps) {
	const {
		urnikFriSeasonalPartOfUrl,
		studentNumber,
		setLetniModifiedLecturesAuditoryAndLaboratoryExcersises,
		setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
		setTemporaryAuditoryAndLaboratoryExcersises,
	} = useBoljsiUrnikContext();

	const handleTimetableReset = () => {
		const controller = new AbortController();
		const url = getUrnikFriUrl(urnikFriSeasonalPartOfUrl, studentNumber);
		// fetchamo za zihr da dobimo najnovejši urnik
		fetchTimetableFromUrnikFRI(url, controller);

		// izbrišemo modified urnik za trenutni semester iz local storaga
		if (urnikFriSeasonalPartOfUrl === "letni") {
			setLetniModifiedLecturesAuditoryAndLaboratoryExcersises(null);
		} else if (urnikFriSeasonalPartOfUrl === "zimski") {
			setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises(null);
		}
		// nastavi tudi temp stvari na null da se res vidi da je bil resetiran
		// (edge case) ko npr. uporabnik med urejanjem urnika pritisne reset timetable
		setTemporaryAuditoryAndLaboratoryExcersises(null);
	};

	return (
		<button type="button" className="timetable-reset-button" onClick={() => handleTimetableReset()}>
			Reset timetable
		</button>
	);
}
