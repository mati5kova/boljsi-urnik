import SettingsSvg from "../../../assets/settings-svgrepo-com.svg";
import {
	IndividualLectureAuditoryOrLaboratoryExcerise,
	useBoljsiUrnikContext,
} from "../../../context/BoljsiUrnikContext";
import getLecturesFromHTML from "../../../functions/getLecturesFromHTML";
import getNewDate from "../../../functions/getNewDate";
import getUrnikFriUrl from "../../../functions/getUrnikFriUrl";
import "./Lecture.css";

export default function LectureDescription(laale: IndividualLectureAuditoryOrLaboratoryExcerise) {
	const {
		inEditMode,
		urnikFriSeasonalPartOfUrl,
		setTemporaryAuditoryAndLaboratoryExcersises,
		setLetniModifiedLecturesAuditoryAndLaboratoryExcersises,
		setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
		letniLecturesAuditoryAndLaboratoryExcersises,
		zimskiLecturesAuditoryAndLaboratoryExcersises,
		zimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
		letniModifiedLecturesAuditoryAndLaboratoryExcersises,
	} = useBoljsiUrnikContext();

	const handleSettingsIconClick = async () => {
		const controller = new AbortController();
		const url = getUrnikFriUrl(urnikFriSeasonalPartOfUrl, undefined, laale.lectureNameHref);
		if (!url) {
			console.error("Error: Provided URL is invalid or empty.");
			return;
		}
		try {
			const response = await fetch(url, { signal: controller.signal });
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			} else {
				const data = await response.text();
				const extractedExcersises = getLecturesFromHTML(data, url, urnikFriSeasonalPartOfUrl, true);

				// naredimo filter po gašperjevem predlogu
				// ne pokažejo se duplikati vaj
				// npr. imamo OIS vaje v četrtek ob 8ih, ko pritisnemo settings na OIS_LV se te iste vaje NE pokažejo ponovno
				setTemporaryAuditoryAndLaboratoryExcersises({
					...extractedExcersises,
					lecturesAV: extractedExcersises.lecturesAV.filter(
						(lecture) =>
							lecture.gridArea !== laale.gridArea ||
							lecture.gridPosition !== laale.gridPosition ||
							lecture.classroom !== laale.classroom
					),
					lecturesLV: extractedExcersises.lecturesLV.filter(
						(lecture) =>
							lecture.gridArea !== laale.gridArea ||
							lecture.gridPosition !== laale.gridPosition ||
							lecture.classroom !== laale.classroom
					),
				});
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.name === "AbortError") {
				console.log("Fetch aborted: Component unmounted or request cancelled.");
			} else {
				console.error("Error fetching timetable:", error);
			}
		}
	};

	const handleNewAuditoryOrLaboratoryExcersiseDateSelected = () => {
		if (!laale.isTemporaryAndShouldBeTreatedAsSuch) return;

		// počistimo temp zadeve ampak ohranimo inEditMode
		setTemporaryAuditoryAndLaboratoryExcersises(null);

		// naredi nov lecture ampak ne sme bit več temporary flaggan
		const newLecture = { ...laale, isTemporaryAndShouldBeTreatedAsSuch: false };

		if (urnikFriSeasonalPartOfUrl === "letni") {
			// Use modified timetable if it exists, otherwise fall back to the original unmodified timetable.
			// uporabi modified urnik (če obstaja) ali pa defaulten urnik fetchan v App.tsx (useEffect hook)
			const baseTimetable =
				letniModifiedLecturesAuditoryAndLaboratoryExcersises || letniLecturesAuditoryAndLaboratoryExcersises;

			if (laale.classType === "AV") {
				// prekopiramo originalen backgroundColor na nov lecture,
				// ker rezultati od https://urnik.fri..../?subject=.... vrne vse predmete/vaje iste barve
				const originalLecture = baseTimetable.lecturesAV.find(
					(lecture) => lecture.lectureNameHref === laale.lectureNameHref
				);
				if (originalLecture) {
					newLecture.lectureBackgroundColor = originalLecture.lectureBackgroundColor;
				}
				setLetniModifiedLecturesAuditoryAndLaboratoryExcersises({
					...baseTimetable,
					dateOfRequest: getNewDate(),
					lecturesAV: baseTimetable.lecturesAV.map((lecture) =>
						lecture.lectureNameHref === laale.lectureNameHref ? newLecture : lecture
					),
				});
			} else if (laale.classType === "LV") {
				const originalLecture = baseTimetable.lecturesLV.find(
					(lecture) => lecture.lectureNameHref === laale.lectureNameHref
				);
				if (originalLecture) {
					newLecture.lectureBackgroundColor = originalLecture.lectureBackgroundColor;
				}
				setLetniModifiedLecturesAuditoryAndLaboratoryExcersises({
					...baseTimetable,
					dateOfRequest: getNewDate(),
					lecturesLV: baseTimetable.lecturesLV.map((lecture) =>
						lecture.lectureNameHref === laale.lectureNameHref ? newLecture : lecture
					),
				});
			}
		} else if (urnikFriSeasonalPartOfUrl === "zimski") {
			const baseTimetable =
				zimskiModifiedLecturesAuditoryAndLaboratoryExcersises || zimskiLecturesAuditoryAndLaboratoryExcersises;

			if (laale.classType === "AV") {
				const originalLecture = baseTimetable.lecturesAV.find(
					(lecture) => lecture.lectureNameHref === laale.lectureNameHref
				);
				if (originalLecture) {
					newLecture.lectureBackgroundColor = originalLecture.lectureBackgroundColor;
				}
				setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises({
					...baseTimetable,
					dateOfRequest: getNewDate(),
					lecturesAV: baseTimetable.lecturesAV.map((lecture) =>
						lecture.lectureNameHref === laale.lectureNameHref ? newLecture : lecture
					),
				});
			} else if (laale.classType === "LV") {
				const originalLecture = baseTimetable.lecturesLV.find(
					(lecture) => lecture.lectureNameHref === laale.lectureNameHref
				);
				if (originalLecture) {
					newLecture.lectureBackgroundColor = originalLecture.lectureBackgroundColor;
				}
				setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises({
					...baseTimetable,
					dateOfRequest: getNewDate(),
					lecturesLV: baseTimetable.lecturesLV.map((lecture) =>
						lecture.lectureNameHref === laale.lectureNameHref ? newLecture : lecture
					),
				});
			}
		}
	};

	return (
		<div
			className="grid-entry"
			style={{
				gridRow: !laale.isTemporaryAndShouldBeTreatedAsSuch ? laale.gridPosition : "",
				backgroundColor: laale.isTemporaryAndShouldBeTreatedAsSuch ? "lightgray" : laale.lectureBackgroundColor,
			}}
			onClick={() => {
				if (laale.isTemporaryAndShouldBeTreatedAsSuch) {
					handleNewAuditoryOrLaboratoryExcersiseDateSelected();
				}
			}}
		>
			<div className="description">
				<div className="top-aligned">
					<div className="row first-row">
						<div className="left-align">
							<span className="link-subject">{laale.lectureName}&nbsp;</span>
							<span className="entry-type">
								{"|"}&nbsp;{laale.classType}
							</span>
						</div>
						{/* da se nastavitve pokažejo moreš bit v edit načinu IN lecture type ne sme bit 
                            predavanje (itak jih nimaš kam premaknit) IN lecture mora biti temp flagged
                        */}
						{/* edit: prostor za settings zobnik je  */}
						{laale.classType !== "P" && laale.isTemporaryAndShouldBeTreatedAsSuch == false ? (
							<div className="right-aligned">
								<img
									src={SettingsSvg}
									alt=""
									height={"20px"}
									style={{
										cursor: `${inEditMode ? "pointer" : "auto"}`,
										padding: "2px 7px 10px 10px",
										opacity: `${inEditMode ? "100%" : "0%"}`,
									}}
									onClick={() => {
										if (inEditMode) {
											handleSettingsIconClick();
										}
									}}
								/>
							</div>
						) : null}
					</div>
					<div className="row">
						<span className="link-classroom">{laale.classroom}</span>
					</div>

					<div className="row">
						<span className="link-teacher">{laale.professor}</span>
					</div>
				</div>
				<div className="bottom-aligned">
					{laale.groups &&
						laale.groups.map((group) => {
							return (
								<span className="row" key={group}>
									<span className="link-group">{group}</span>
								</span>
							);
						})}
				</div>
			</div>
		</div>
	);
}
