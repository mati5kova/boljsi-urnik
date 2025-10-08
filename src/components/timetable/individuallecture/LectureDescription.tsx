import { useMemo, useRef } from "react";
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
	// za preprecevanje podvojenih fetchov...
	const isFetchingRef = useRef(false);

	const {
		inEditMode,
		urnikFriSeasonalPartOfUrl,
		temporaryAuditoryAndLaboratoryExcersises,
		setTemporaryAuditoryAndLaboratoryExcersises,
		setLetniModifiedLecturesAuditoryAndLaboratoryExcersises,
		setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
		letniLecturesAuditoryAndLaboratoryExcersises,
		zimskiLecturesAuditoryAndLaboratoryExcersises,
		zimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
		letniModifiedLecturesAuditoryAndLaboratoryExcersises,
		lockedLectureKey,
		setLockedLectureKey,
	} = useBoljsiUrnikContext();

	// stabilen kljuc za trenuten laale
	const lectureKey = useMemo(
		() => `${laale.lectureNameHref}|${laale.gridArea}|${laale.gridPosition}|${laale.classType}|${laale.classroom}`,
		[laale.lectureNameHref, laale.gridArea, laale.gridPosition, laale.classType, laale.classroom]
	);

	const overlayOpen = temporaryAuditoryAndLaboratoryExcersises !== null;

	const handleSettingsIconClick = async () => {
		if (isFetchingRef.current) return; // guard

		isFetchingRef.current = true;

		// zaklenemo trenutni laale
		setLockedLectureKey(lectureKey);

		const controller = new AbortController();
		const url = getUrnikFriUrl(urnikFriSeasonalPartOfUrl, undefined, laale.lectureNameHref);
		if (!url) {
			console.error("Error: Provided URL is invalid or empty.");
			setLockedLectureKey(null);
			isFetchingRef.current = false;
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
				console.error("Fetch aborted: Component unmounted or request cancelled.");
			} else {
				console.error("Error fetching timetable:", error);
			}
			setLockedLectureKey(null);
		} finally {
			isFetchingRef.current = false;
		}
	};

	const handleNewAuditoryOrLaboratoryExcersiseDateSelected = () => {
		setLockedLectureKey(null);

		if (!laale.isTemporaryAndShouldBeTreatedAsSuch) return;

		// počistimo temp zadeve ampak ohranimo inEditMode
		setTemporaryAuditoryAndLaboratoryExcersises(null);

		// naredi nov lecture ampak ne sme bit več temporary flaggan
		const newLecture = { ...laale, isTemporaryAndShouldBeTreatedAsSuch: false };

		if (urnikFriSeasonalPartOfUrl === "letni") {
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
				// cursor je pointer na vseh vajah (torej na ne predavanjih) in ce smo v `inEditMode`
				cursor:
					laale.isTemporaryAndShouldBeTreatedAsSuch || (laale.classType !== "P" && inEditMode)
						? "pointer"
						: "auto",
				// cel laale je clickable ce je temp ali inEditMode
				pointerEvents: inEditMode || laale.isTemporaryAndShouldBeTreatedAsSuch ? "auto" : "none",
			}}
			onClick={() => {
				// ce pritisnemo na temp vaje jih takoj izberemo
				if (laale.isTemporaryAndShouldBeTreatedAsSuch) {
					handleNewAuditoryOrLaboratoryExcersiseDateSelected();
					return;
				}

				// ce je overlay odprt ga prvi klik kamorkoli zapre
				if (overlayOpen) {
					setTemporaryAuditoryAndLaboratoryExcersises(null);
					setLockedLectureKey(null);
					return;
				}

				if (!inEditMode || laale.classType === "P") {
					return;
				}

				// ce je lecture zaklenjen ignoriramo klik
				if (lockedLectureKey === lectureKey) {
					return;
				}

				// else - fetchamo moznosti
				handleSettingsIconClick();
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
									alt="O"
									height={"20px"}
									style={{
										cursor: `${inEditMode ? "pointer" : "auto"}`,
										padding: "2px 7px 10px 10px",
										opacity: `${inEditMode ? "100%" : "0%"}`,
										pointerEvents: inEditMode && lockedLectureKey !== lectureKey ? "auto" : "none",
									}}
									onClick={(e) => {
										e.stopPropagation();

										// overlay dismiss naj dela vedno
										if (overlayOpen) {
											setTemporaryAuditoryAndLaboratoryExcersises(null);
											setLockedLectureKey(null);
											return;
										}
										if (!inEditMode || lockedLectureKey === lectureKey) return;
										handleSettingsIconClick();
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
