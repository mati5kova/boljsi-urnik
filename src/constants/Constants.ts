import {
    IndividualLectureAuditoryOrLaboratoryExcerise,
    LecturesAuditoryAndLaboratoryExcersises,
} from "../context/BoljsiUrnikContext";

export const defaultLecturesAuditoryAndLaboratoryExcersisesObject: LecturesAuditoryAndLaboratoryExcersises = {
    seasonId: "zimski",
    schoolYearId: "",
    dateOfRequest: new Date("1900-01-01T00:00:00"),
    lecturesP: [],
    lecturesAV: [],
    lecturesLV: [],
};

// mogoče nej bo 1 ker en fetch na dan res ni nič takega
// raje naj ne bo manj ker v obdobju ko se urnik veliko spreminja je fino met frišne informacije (npr. začetek novega semestra)
export const _DELAY_IN_DAYS_TO_WAIT_BEFORE_ANOTHER_FETCH = 1;
export const _WAITING_RETRY_DELAY_IN_MS = 15 * 60 * 1000; // 15 min

export const dnevi: { [key: string]: string } = {
    pondeljek: "dayMON",
    torek: "dayTUE",
    sreda: "dayWED",
    četrtek: "dayTHU",
    petek: "dayFRI",
};

export const ure: string[] = [
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
];

// seznam polj ki se odstranijo ko se ustvari sharable link do urnika
export const keysToRemove = new Set<keyof IndividualLectureAuditoryOrLaboratoryExcerise>([
    "groups",
    "isTemporaryAndShouldBeTreatedAsSuch",
    "lectureNameHref",
    "editModeFetchHref",
]);

// preslikava imen
export const longToShortLaaleNameKeyMap: Record<string, string> = {
    gridPosition: "a",
    lectureBackgroundColor: "b",
    gridArea: "c",
    lectureName: "d",
    lectureNameHref: "e",
    editModeFetchHref: "m",
    classType: "f",
    classroom: "g",
    professor: "h",
    groups: "i",
};
