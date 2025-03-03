import getCurrentSchoolYear from "./getCurrentSchoolYear";

// seasonalpart: zimski | letni
// vs -> vpisna številka (npr. 63240***)
// subject -> npr. ?subject=63215 (OIS)
//
// vs in subject sta optional parametra -> pazi da vedno dobiš samo enega (drugače se bo uporabljal vs)
export default function getUrnikFriUrl(seasonalPart: string, vs?: number, subject?: string): string {
	const schoolYear = getCurrentSchoolYear();

	if (vs) {
		return `https://urnik.fri.uni-lj.si/timetable/fri-${schoolYear[0]}_${schoolYear[1]}-${seasonalPart}/allocations?student=${vs}`;
	} else if (subject) {
		return `https://urnik.fri.uni-lj.si/timetable/fri-${schoolYear[0]}_${schoolYear[1]}-${seasonalPart}/allocations${subject}`;
	}
	return "";
}
