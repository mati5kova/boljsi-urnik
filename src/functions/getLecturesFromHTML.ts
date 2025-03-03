import * as cheerio from "cheerio";
import { defaultLecturesAuditoryAndLaboratoryExcersisesObject } from "../constants/Constants";
import {
	IndividualLectureAuditoryOrLaboratoryExcerise,
	LecturesAuditoryAndLaboratoryExcersises,
	Season,
} from "../context/BoljsiUrnikContext";
import getNewDate from "./getNewDate";

export default function getLecturesFromHTML(
	// fetchana zadeva npr. iz App.tsx (useEffect hook)
	htmlAsString: string,

	// URL
	urnikURL: string,

	// zimski | letni
	seasonalPartOfUrl: Season,

	// vrednost je true če prihaja zahteva za parsanje samo vaj
	// torej ko uporabnik pritisne ikono za nastavitev in se v LectureDescription.tsx naredi request na fri urnik z ?subject=....
	extractOnlyAuditoryAndLaboratoryExcerises: boolean
): LecturesAuditoryAndLaboratoryExcersises {
	if (!htmlAsString) {
		return defaultLecturesAuditoryAndLaboratoryExcersisesObject;
	}

	const $ = cheerio.load(htmlAsString, { baseURI: urnikURL });
	const lecturesP: IndividualLectureAuditoryOrLaboratoryExcerise[] = [];
	const lecturesAV: IndividualLectureAuditoryOrLaboratoryExcerise[] = [];
	const lecturesLV: IndividualLectureAuditoryOrLaboratoryExcerise[] = [];

	$("div.grid-entry").each((_, element) => {
		// dobimo pozicijo v gridu kjer se nahajajo vaje/predavanje + backgroundColor
		// oblika -> [grid-row, background-color]
		const gridEntryAttributes: [string, string] = ["", ""];
		$(element)
			.attr("style")
			?.split(";")
			.find((at) => {
				if (at.includes("grid-row")) {
					gridEntryAttributes[0] = at.replace("grid-row: ", "").trim();
				} else if (at.includes("background-color")) {
					gridEntryAttributes[1] = at.replace("background-color: ", "").trim();
				}
			});

		const gridArea = $(element).parent().attr("style")?.trim().replace("grid-area: ", "") || "";

		// dobimo predmete
		const lectureName = $(element).find("a.link-subject").text().trim();

		const lectureNameHref = $(element).find("a.link-subject").attr("href")?.trim() || "";

		const rawEntryType = $(element).find("span.entry-type").text().trim(); // | P, | AV, | LV
		const typeCleaned = rawEntryType.replace("|", "").trim(); // | P -> "P"; | AV -> "AV"...

		// dobimo predavalnico in profesorja
		const classroom = $(element).find("a.link-classroom").text().trim();
		const professor = $(element).find("a.link-teacher").text().trim();

		// seznam skupin ki obiskujejo neko predavanje
		const groups: string[] = [];
		$(element)
			.find("a.link-group")
			.each((_, groupElem) => {
				groups.push($(groupElem).text().trim());
			});

		// naredimo objekt za seznam
		const lecture = {
			gridPosition: gridEntryAttributes[0],
			lectureBackgroundColor: gridEntryAttributes[1],
			gridArea,
			lectureName,
			lectureNameHref,
			classType: typeCleaned, // P, AV, LV (brez |)
			classroom,
			professor,
			groups,
			// flag pomemben za renderanje v LectureDescription.tsx
			isTemporaryAndShouldBeTreatedAsSuch: extractOnlyAuditoryAndLaboratoryExcerises ? true : false,
		};

		// damo stvari v pravi list
		//
		// dodaten pogoj za ziher, čeprav uporabnik itak ne more premikat predavanj
		if (typeCleaned === "P" && extractOnlyAuditoryAndLaboratoryExcerises == false) {
			lecturesP.push(lecture);
		} else if (typeCleaned === "AV") {
			lecturesAV.push(lecture);
		} else if (typeCleaned === "LV") {
			lecturesLV.push(lecture);
		}
	});

	return {
		seasonId: seasonalPartOfUrl,
		dateOfRequest: getNewDate(),
		lecturesP,
		lecturesAV,
		lecturesLV,
	};
}
