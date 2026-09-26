import { describe, expect, it } from "vitest";
import {
    IndividualLectureAuditoryOrLaboratoryExcerise,
    LecturesAuditoryAndLaboratoryExcersises,
} from "../context/BoljsiUrnikContext";
import { areOfficialTimetablesEqual, classifyOfficialTimetableChange } from "./compareOfficialTimetables";

const createLecture = (
    overrides: Partial<IndividualLectureAuditoryOrLaboratoryExcerise> = {},
): IndividualLectureAuditoryOrLaboratoryExcerise => ({
    gridPosition: "2 / span 2",
    gridArea: "dayMON",
    lectureName: "Test_LV",
    lectureBackgroundColor: "rgb(1, 2, 3)",
    lectureNameHref: "?activity=1",
    editModeFetchHref: "?activity=1",
    classType: "LV",
    classroom: "P01",
    professor: "Profesor",
    groups: ["B", "A"],
    isTemporaryAndShouldBeTreatedAsSuch: false,
    ...overrides,
});

const createTimetable = (
    overrides: Partial<LecturesAuditoryAndLaboratoryExcersises> = {},
): LecturesAuditoryAndLaboratoryExcersises => ({
    seasonId: "zimski",
    schoolYearId: "2026_2027",
    dateOfRequest: new Date(2026, 8, 1),
    lecturesP: [],
    lecturesAV: [],
    lecturesLV: [createLecture(), createLecture({ lectureName: "Drugi_LV", lectureNameHref: "?activity=2" })],
    ...overrides,
});

describe("primerjava uradnih urnikov", () => {
    it("ignorira datum, temporary flag ter vrstni red predavanj in skupin", () => {
        const first = createTimetable();
        const second = createTimetable({
            dateOfRequest: new Date(2026, 8, 20),
            lecturesLV: [
                createLecture({ lectureName: "Drugi_LV", lectureNameHref: "?activity=2", groups: ["A", "B"] }),
                createLecture({ groups: ["A", "B"], isTemporaryAndShouldBeTreatedAsSuch: true }),
            ],
        });

        expect(areOfficialTimetablesEqual(first, second)).toBe(true);
        expect(classifyOfficialTimetableChange(first, second)).toBe("same");
    });

    it.each([
        ["gridPosition", "3 / span 2"],
        ["gridArea", "dayTUE"],
        ["lectureName", "Spremenjen_LV"],
        ["lectureBackgroundColor", "rgb(3, 2, 1)"],
        ["lectureNameHref", "?activity=9"],
        ["editModeFetchHref", "?activity=9"],
        ["classType", "AV"],
        ["classroom", "P02"],
        ["professor", "Drug profesor"],
        ["groups", ["C"]],
    ] as const)("zazna spremembo polja %s", (field, value) => {
        const previous = createTimetable();
        const changed = createTimetable({ lecturesLV: [createLecture({ [field]: value })] });

        expect(classifyOfficialTimetableChange(previous, changed)).toBe("changed");
    });

    it("drugačno leto vedno obravnava kot novo šolsko leto", () => {
        const previous = createTimetable({ schoolYearId: "2025_2026" });
        const next = createTimetable({ schoolYearId: "2026_2027" });

        expect(classifyOfficialTimetableChange(previous, next)).toBe("new-school-year");
    });

    it("prvi uradni urnik ne šteje kot sprememba", () => {
        const empty = createTimetable({ lecturesLV: [] });
        expect(classifyOfficialTimetableChange(empty, createTimetable())).toBe("first");
    });
});
