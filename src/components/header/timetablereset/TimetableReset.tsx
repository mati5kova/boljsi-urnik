import { useBoljsiUrnikContext } from "../../../context/BoljsiUrnikContext";
import type { HeaderProps } from "../Header";
import "./TimetableReset.css";

interface TimetableResetProps {
	refreshTimetable: HeaderProps["refreshTimetable"];
}

export default function TimetableReset({ refreshTimetable }: TimetableResetProps) {
	const {
		urnikFriSeasonalPartOfUrl,
		setLetniModifiedLecturesAuditoryAndLaboratoryExcersises,
		setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
		setTemporaryAuditoryAndLaboratoryExcersises,
		setLockedLectureKey,
	} = useBoljsiUrnikContext();

	const handleTimetableReset = () => {
		// fetchamo za zihr da dobimo najnovejši urnik
		void refreshTimetable({ force: true, reason: "manual-reset" });

		// izbrišemo modified urnik za trenutni semester iz local storaga
		if (urnikFriSeasonalPartOfUrl === "letni") {
			setLetniModifiedLecturesAuditoryAndLaboratoryExcersises(null);
		} else if (urnikFriSeasonalPartOfUrl === "zimski") {
			setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises(null);
		}
		// nastavi tudi temp stvari na null da se res vidi da je bil resetiran
		// (edge case) ko npr. uporabnik med urejanjem urnika pritisne reset timetable
		setTemporaryAuditoryAndLaboratoryExcersises(null);
		setLockedLectureKey(null);
	};

	return (
		<button type="button" className="timetable-reset" onClick={() => handleTimetableReset()}>
			Ponastavi urnik
		</button>
	);
}
