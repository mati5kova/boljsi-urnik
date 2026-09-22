import type { LecturesAuditoryAndLaboratoryExcersises } from "../context/BoljsiUrnikContext";
import getCurrentSchoolYear from "./getCurrentSchoolYear";
import getNewDate from "./getNewDate";

export default function getSchoolYearId(date: Date = getNewDate()): string {
    const [start, end] = getCurrentSchoolYear(date);
    return `${start}_${end}`;
}

export function hasOfficialLectures(timetable: LecturesAuditoryAndLaboratoryExcersises): boolean {
    return timetable.lecturesP.length + timetable.lecturesAV.length + timetable.lecturesLV.length > 0;
}

export function getStoredSchoolYearId(timetable: LecturesAuditoryAndLaboratoryExcersises | null): string | null {
    if (!timetable || !hasOfficialLectures(timetable)) return null;
    if (timetable.schoolYearId) return timetable.schoolYearId;

    const dateOfRequest = new Date(timetable.dateOfRequest);
    if (Number.isNaN(dateOfRequest.getTime())) return null;

    return getSchoolYearId(dateOfRequest);
}

export function getNextSchoolYearBoundary(date: Date = getNewDate()): Date {
    const boundaryYear = date.getMonth() + 1 >= 9 ? date.getFullYear() + 1 : date.getFullYear();
    return new Date(boundaryYear, 8, 1, 0, 0, 0, 0);
}
