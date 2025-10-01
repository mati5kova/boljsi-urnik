import { useSearchParams } from "react-router";
import { keysToRemove, longToShortLaaleNameKeyMap } from "../../constants/Constants";
import { IndividualLectureAuditoryOrLaboratoryExcerise, useBoljsiUrnikContext } from "../../context/BoljsiUrnikContext";
import { expandTimetableData, makeSharableParam } from "../../functions/manipulateSearchParams";
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
		setIsViewingASharedTimetable,
	} = useBoljsiUrnikContext();

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

	// modified urnik za zimski semester
	const zimskiModified = [
		...(zimskiModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesP ?? []),
		...(zimskiModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesAV ?? []),
		...(zimskiModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesLV ?? []),
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
	// modified urnik za letni semester
	const letniModified = [
		...(letniModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesP ?? []),
		...(letniModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesAV ?? []),
		...(letniModifiedLecturesAuditoryAndLaboratoryExcersises?.lecturesLV ?? []),
		...temporaryLecturesAV,
		...temporaryLecturesLV,
	];

	// izberi pravi list glede na semester in/ali je uporabnik že kaj spreminjal urnik
	let lecturesToRender: IndividualLectureAuditoryOrLaboratoryExcerise[] =
		urnikFriSeasonalPartOfUrl === "zimski"
			? zimskiModifiedLecturesAuditoryAndLaboratoryExcersises === null
				? zimskiDefault
				: zimskiModified
			: letniModifiedLecturesAuditoryAndLaboratoryExcersises === null
			? letniDefault
			: letniModified;

	const [urlParams] = useSearchParams();
	const sharedTimetable = urlParams.get("sharedTimetable");

	if (sharedTimetable && urlParams.size === 1) {
		try {
			let decoded = sharedTimetable;
			if (/%[0-9A-Fa-f]{2}/.test(sharedTimetable)) {
				decoded = decodeURIComponent(sharedTimetable);
			}
			const parsed = JSON.parse(decoded) as Record<string, unknown>[];
			lecturesToRender = expandTimetableData(parsed, longToShortLaaleNameKeyMap);
			setIsViewingASharedTimetable(true);
		} catch (err) {
			console.error("URI decode/parse error:", err);
			setIsViewingASharedTimetable(false);
		}
	} else {
		console.log(
			"Sharable link:",
			`${window.location.origin}?sharedTimetable=${makeSharableParam(
				lecturesToRender,
				longToShortLaaleNameKeyMap,
				keysToRemove
			)}`
		);
	}

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
