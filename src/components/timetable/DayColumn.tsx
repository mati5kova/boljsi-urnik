import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router";
import { longToShortLaaleNameKeyMap } from "../../constants/Constants";
import { IndividualLectureAuditoryOrLaboratoryExcerise, useBoljsiUrnikContext } from "../../context/BoljsiUrnikContext";
import { expandTimetableData } from "../../functions/manipulateSearchParams";
import Lecture from "./individuallecture/Lecture";
import "./Timetable.css";

interface DayColumnProps {
	i: number; // index stolpca
	nameOfDay: string; // ponedeljek, torek, sreda, ...
	gridAreaName: string; // dayMON, dayTUE, dayWED,  ...
}

export default function DayColumn({ i, nameOfDay, gridAreaName }: DayColumnProps) {
	const {
		temporaryAuditoryAndLaboratoryExcersises,
		urnikFriSeasonalPartOfUrl,
		zimskiLecturesAuditoryAndLaboratoryExcersises,
		zimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
		letniLecturesAuditoryAndLaboratoryExcersises,
		letniModifiedLecturesAuditoryAndLaboratoryExcersises,
		setActuallyRenderedTimetable,
	} = useBoljsiUrnikContext();

	const [urlParams] = useSearchParams();
	const sharedTimetable = urlParams.get("sharedTimetable");
	const hasUrlParameters = urlParams.size >= 1;

	const lecturesToRender: IndividualLectureAuditoryOrLaboratoryExcerise[] = useMemo(() => {
		// temp zadeve če smo inEditMode in je treba renderat možne zadeve za izbrat
		// default je prazen array (ne vpliva nič na rendering)
		const temporaryLecturesAV = temporaryAuditoryAndLaboratoryExcersises?.lecturesAV ?? [];
		const temporaryLecturesLV = temporaryAuditoryAndLaboratoryExcersises?.lecturesLV ?? [];

		// default urnik za zimski semester
		const zimskiDefault = [
			...zimskiLecturesAuditoryAndLaboratoryExcersises.lecturesP,
			...zimskiLecturesAuditoryAndLaboratoryExcersises.lecturesAV,
			...zimskiLecturesAuditoryAndLaboratoryExcersises.lecturesLV,
			...temporaryLecturesAV,
			...temporaryLecturesLV,
		];

		// default urnik za letni semester
		const letniDefault = [
			...letniLecturesAuditoryAndLaboratoryExcersises.lecturesP,
			...letniLecturesAuditoryAndLaboratoryExcersises.lecturesAV,
			...letniLecturesAuditoryAndLaboratoryExcersises.lecturesLV,
			...temporaryLecturesAV,
			...temporaryLecturesLV,
		];

		// modified urnik za zimski semester
		const zimskiModified = [
			...(zimskiModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesP ?? []),
			...(zimskiModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesAV ?? []),
			...(zimskiModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesLV ?? []),
			...temporaryLecturesAV,
			...temporaryLecturesLV,
		];

		// modified urnik za letni semester
		const letniModified = [
			...(letniModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesP ?? []),
			...(letniModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesAV ?? []),
			...(letniModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesLV ?? []),
			...temporaryLecturesAV,
			...temporaryLecturesLV,
		];

		const base =
			urnikFriSeasonalPartOfUrl === "zimski"
				? zimskiModifiedLecturesAuditoryAndLaboratoryExcersises === null
					? zimskiDefault
					: zimskiModified
				: letniModifiedLecturesAuditoryAndLaboratoryExcersises === null
				? letniDefault
				: letniModified;

		if (sharedTimetable && hasUrlParameters) {
			try {
				const decoded = /%[0-9A-Fa-f]{2}/.test(sharedTimetable)
					? decodeURIComponent(sharedTimetable)
					: sharedTimetable;

				const parsed = JSON.parse(decoded) as Record<string, unknown>[];

				return expandTimetableData(parsed, longToShortLaaleNameKeyMap);
			} catch (err) {
				console.error("URI decode/parse error:", err);
				return base;
			}
		}

		return base;
	}, [
		urnikFriSeasonalPartOfUrl,
		zimskiLecturesAuditoryAndLaboratoryExcersises,
		zimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
		letniLecturesAuditoryAndLaboratoryExcersises,
		letniModifiedLecturesAuditoryAndLaboratoryExcersises,
		temporaryAuditoryAndLaboratoryExcersises,
		sharedTimetable,
		hasUrlParameters,
	]);

	useEffect(() => {
		setActuallyRenderedTimetable(lecturesToRender);
	}, [lecturesToRender, setActuallyRenderedTimetable]);

	return (
		<>
			<div className="grid-day" style={{ gridColumn: `${i}` }}>
				{nameOfDay}
			</div>
			<div className="grid-day-column" style={{ gridArea: gridAreaName }}>
				{lecturesToRender
					.filter((laale) => laale.gridArea === gridAreaName)
					.map((laale, index) => (
						<Lecture key={laale.lectureName + index} {...laale} />
					))}
			</div>
		</>
	);
}
