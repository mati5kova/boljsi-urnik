import { afterEach, describe, expect, it, vi } from "vitest";
import { LecturesAuditoryAndLaboratoryExcersises } from "../context/BoljsiUrnikContext";
import getCurrentSchoolYear from "./getCurrentSchoolYear";
import getSchoolYearId, { getNextSchoolYearBoundary, getStoredSchoolYearId } from "./getSchoolYearId";
import getUrnikFriUrl from "./getUrnikFriUrl";
import { shouldFetchTimetable, shouldRetryWaitingTimetable } from "./shouldFetchTimetable";

const createTimetable = (dateOfRequest: Date, schoolYearId = ""): LecturesAuditoryAndLaboratoryExcersises => ({
    seasonId: "zimski",
    schoolYearId,
    dateOfRequest,
    lecturesP: [
        {
            gridPosition: "2 / span 2",
            gridArea: "dayMON",
            lectureName: "Test_P",
            lectureBackgroundColor: "rgb(1, 2, 3)",
            lectureNameHref: "?activity=1",
            editModeFetchHref: "?activity=2",
            classType: "P",
            classroom: "P01",
            professor: "Profesor",
            groups: ["1_BUN_RI"],
            isTemporaryAndShouldBeTreatedAsSuch: false,
        },
    ],
    lecturesAV: [],
    lecturesLV: [],
});

describe("šolsko leto", () => {
    it("preklopi natančno 1. septembra", () => {
        expect(getCurrentSchoolYear(new Date(2026, 7, 31, 23, 59))).toEqual([2025, 2026]);
        expect(getCurrentSchoolYear(new Date(2026, 8, 1, 0, 0))).toEqual([2026, 2027]);
        expect(getSchoolYearId(new Date(2026, 8, 1, 0, 0))).toBe("2026_2027");
    });

    it("vrne naslednjo mejo, ki jo lahko uporabi odprt zavihek", () => {
        expect(getNextSchoolYearBoundary(new Date(2026, 7, 31, 23, 59))).toEqual(new Date(2026, 8, 1, 0, 0));
        expect(getNextSchoolYearBoundary(new Date(2026, 8, 1, 0, 0))).toEqual(new Date(2027, 8, 1, 0, 0));
    });

    it("uporabi zajeto šolsko leto tudi pri sestavi URL-ja", () => {
        expect(getUrnikFriUrl("zimski", 63240123, undefined, "2026_2027")).toBe(
            "https://urnik.fri.uni-lj.si/timetable/fri-2026_2027-zimski/allocations?student=63240123",
        );
    });

    it("iz datuma migrira legacy urnik brez schoolYearId", () => {
        expect(getStoredSchoolYearId(createTimetable(new Date(2026, 7, 31, 12, 0)))).toBe("2025_2026");
        expect(getStoredSchoolYearId(createTimetable(new Date("invalid")))).toBeNull();
    });
});

describe("dnevna refresh politika", () => {
    afterEach(() => vi.useRealTimers());

    it("osveži pri neveljavnem datumu in po najmanj enem dnevu", () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date(2026, 8, 10, 12, 0));

        expect(shouldFetchTimetable({ dateOfRequest: new Date("invalid") })).toBe(true);
        expect(shouldFetchTimetable({ dateOfRequest: new Date(2026, 8, 9, 12, 0) })).toBe(true);
        expect(shouldFetchTimetable({ dateOfRequest: new Date(2026, 8, 10, 11, 0) })).toBe(false);
    });

    it("med čakanjem ne poskuša pogosteje kot na 15 minut", () => {
        const now = new Date(2026, 8, 10, 12, 0).getTime();
        expect(shouldRetryWaitingTimetable(0, now)).toBe(true);
        expect(shouldRetryWaitingTimetable(now - 14 * 60 * 1000, now)).toBe(false);
        expect(shouldRetryWaitingTimetable(now - 15 * 60 * 1000, now)).toBe(true);
    });
});
