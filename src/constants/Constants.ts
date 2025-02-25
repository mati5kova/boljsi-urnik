import { LecturesAuditoryAndLaboratoryExcersises } from "../context/BoljsiUrnikContext";

export const defaultLecturesAuditoryAndLaboratoryExcersisesObject: LecturesAuditoryAndLaboratoryExcersises = {
	dateOfRequest: new Date("1-1-1900"),
	lecturesP: [],
	lecturesAV: [],
	lecturesLV: [],
};

export const _DELAY_IN_DAYS_TO_WAIT_BEFORE_ANOTHER_FETCH = 7; // 7 dni
