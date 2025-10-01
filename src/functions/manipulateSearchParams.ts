import { IndividualLectureAuditoryOrLaboratoryExcerise } from "../context/BoljsiUrnikContext";

// reverse map za pretvori skrajsana imena nazaj v originalna
export const reverseKeyMap = (keyMap: Record<string, string>): Record<string, string> => {
	return Object.fromEntries(Object.entries(keyMap).map(([k, v]) => [v, k]));
};

// odstrani dolocene kljuce in skrajsaj imena preostalih
export function shortenTimetableData(
	data: IndividualLectureAuditoryOrLaboratoryExcerise[],
	keyMap: Record<string, string>,
	keysToRemove: Set<keyof IndividualLectureAuditoryOrLaboratoryExcerise>
): Record<string, unknown>[] {
	return data.map((obj) => {
		const entries = Object.entries(obj).filter(
			([key]) => !keysToRemove.has(key as keyof IndividualLectureAuditoryOrLaboratoryExcerise)
		);
		return Object.fromEntries(entries.map(([k, v]) => [keyMap[k] || k, v]));
	});
}

// razsiri skrajsana imena nazaj v originalna
export function expandTimetableData(
	data: Record<string, unknown>[],
	keyMap: Record<string, string>
): IndividualLectureAuditoryOrLaboratoryExcerise[] {
	const revMap = reverseKeyMap(keyMap);
	return data.map((obj) => {
		const expanded = Object.fromEntries(Object.entries(obj).map(([k, v]) => [revMap[k] || k, v]));
		return expanded as unknown as IndividualLectureAuditoryOrLaboratoryExcerise;
	});
}

// encode data v sharable url parameter
export function makeSharableParam(
	data: IndividualLectureAuditoryOrLaboratoryExcerise[],
	keyMap: Record<string, string>,
	keysToRemove: Set<keyof IndividualLectureAuditoryOrLaboratoryExcerise>
): string {
	const shortened = shortenTimetableData(data, keyMap, keysToRemove);
	return encodeURIComponent(JSON.stringify(shortened));
}
