import { useBoljsiUrnikContext } from "../../context/BoljsiUrnikContext";
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
		setTemporaryAuditoryAndLaboratoryExcersises,
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
	const lecturesToRender =
		urnikFriSeasonalPartOfUrl === "zimski"
			? zimskiModifiedLecturesAuditoryAndLaboratoryExcersises === null
				? zimskiDefault
				: zimskiModified
			: letniModifiedLecturesAuditoryAndLaboratoryExcersises === null
			? letniDefault
			: letniModified;

	return (
		<>
			<div className="grid-day" style={{ gridColumn: `${i}` }}>
				{nameOfDay}
			</div>
			<div
				className="grid-day-column"
				style={{ gridArea: gridAreaName }}
				// za clearanje tempa
				onClick={(e) => {
					// potreben check drugače onClick šteje tudi če pritisnemo Lecture.tsx
					// hočemo da ko pritisnemo na belo ozadje IN smo inEditMode IN temp != null -> clearamo temp
					// po gašperjevem predlogu
					if (e.target === e.currentTarget) {
						setTemporaryAuditoryAndLaboratoryExcersises(null);
					}
				}}
			>
				{lecturesToRender
					.filter((laale) => laale.gridArea === gridAreaName)
					.map((laale, index) => (
						<Lecture key={laale.lectureName + index} {...laale} />
					))}
			</div>
		</>
	);
}
