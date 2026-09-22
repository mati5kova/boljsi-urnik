import type {
    IndividualLectureAuditoryOrLaboratoryExcerise,
    LecturesAuditoryAndLaboratoryExcersises,
} from "../context/BoljsiUrnikContext";
import { getStoredSchoolYearId, hasOfficialLectures } from "./getSchoolYearId";

const canonicalizeLecture = (lecture: IndividualLectureAuditoryOrLaboratoryExcerise) => ({
    gridPosition: lecture.gridPosition,
    gridArea: lecture.gridArea,
    lectureName: lecture.lectureName,
    lectureBackgroundColor: lecture.lectureBackgroundColor,
    lectureNameHref: lecture.lectureNameHref,
    editModeFetchHref: lecture.editModeFetchHref,
    classType: lecture.classType,
    classroom: lecture.classroom,
    professor: lecture.professor,
    groups: [...lecture.groups].sort(),
});

const canonicalizeList = (lectures: IndividualLectureAuditoryOrLaboratoryExcerise[]) =>
    lectures.map(canonicalizeLecture).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));

// dateOfRequest in interni temporary flag nista del uradnega urnika, zato ju namenoma ne primerjamo.
export function areOfficialTimetablesEqual(
    first: LecturesAuditoryAndLaboratoryExcersises,
    second: LecturesAuditoryAndLaboratoryExcersises,
): boolean {
    return (
        first.seasonId === second.seasonId &&
        JSON.stringify(canonicalizeList(first.lecturesP)) === JSON.stringify(canonicalizeList(second.lecturesP)) &&
        JSON.stringify(canonicalizeList(first.lecturesAV)) === JSON.stringify(canonicalizeList(second.lecturesAV)) &&
        JSON.stringify(canonicalizeList(first.lecturesLV)) === JSON.stringify(canonicalizeList(second.lecturesLV))
    );
}

export type OfficialTimetableChange = "first" | "same" | "changed" | "new-school-year";

export function classifyOfficialTimetableChange(
    previous: LecturesAuditoryAndLaboratoryExcersises,
    next: LecturesAuditoryAndLaboratoryExcersises,
): OfficialTimetableChange {
    if (!hasOfficialLectures(previous)) return "first";

    const previousSchoolYearId = getStoredSchoolYearId(previous);
    if (!previousSchoolYearId || previousSchoolYearId !== next.schoolYearId) return "new-school-year";

    return areOfficialTimetablesEqual(previous, next) ? "same" : "changed";
}
