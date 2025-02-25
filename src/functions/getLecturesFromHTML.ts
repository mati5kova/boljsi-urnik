import * as cheerio from "cheerio";
import { defaultLecturesAuditoryAndLaboratoryExcersisesObject } from "../constants/Constants";
import {
	IndividualLectureAuditoryOrLaboratoryExcerise,
	LecturesAuditoryAndLaboratoryExcersises,
} from "../context/BoljsiUrnikContext";
import getNewDate from "./getNewDate";

export default function getLecturesFromHTML(
	htmlAsString: string,
	urnikURL: string
): LecturesAuditoryAndLaboratoryExcersises {
	if (!htmlAsString) {
		return defaultLecturesAuditoryAndLaboratoryExcersisesObject;
	}

	const $ = cheerio.load(htmlAsString, { baseURI: urnikURL });
	const lecturesP: IndividualLectureAuditoryOrLaboratoryExcerise[] = [];
	const lecturesAV: IndividualLectureAuditoryOrLaboratoryExcerise[] = [];
	const lecturesLV: IndividualLectureAuditoryOrLaboratoryExcerise[] = [];

	$("div.grid-entry").each((_, element) => {
		// dobimo pozicijo v gridu kjer se nahajaja vaje/predavanje
		const gridPosition =
			$(element)
				.attr("style")
				?.split(";")
				.find((el) => el.includes("grid-row"))
				?.trim() || ""; // || "" da ni undefined slučajno

		// dobimo predmete
		const className = $(element).find("a.link-subject").text().trim();

		const classNameHref = $(element).find("a.link-subject").attr("href")?.trim() || "";

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
			gridPosition,
			className,
			classNameHref,
			classType: `| ${typeCleaned}`,
			classroom,
			professor,
			groups,
		};

		// damo stvari v pravi list
		if (typeCleaned === "P") {
			lecturesP.push(lecture);
		} else if (typeCleaned === "AV") {
			lecturesAV.push(lecture);
		} else if (typeCleaned === "LV") {
			lecturesLV.push(lecture);
		}
	});

	return {
		dateOfRequest: getNewDate(),
		lecturesP,
		lecturesAV,
		lecturesLV,
	};
}
