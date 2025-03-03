import { LecturesAuditoryAndLaboratoryExcersises } from "../context/BoljsiUrnikContext";

export const defaultLecturesAuditoryAndLaboratoryExcersisesObject: LecturesAuditoryAndLaboratoryExcersises = {
	seasonId: "zimski",
	dateOfRequest: new Date("1-1-1900"),
	lecturesP: [],
	lecturesAV: [],
	lecturesLV: [],
};

// mogoče nej bo 1 ker en fetch na dan res ni nič takega
// raje naj ne bo manj ker v obdobju ko se urnik veliko spreminja je fino met frišne informacije (npr. začetek novega semestra)
export const _DELAY_IN_DAYS_TO_WAIT_BEFORE_ANOTHER_FETCH = 1;
