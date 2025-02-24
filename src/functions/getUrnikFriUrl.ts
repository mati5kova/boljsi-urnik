import getCurrentSchoolYear from "./getCurrentSchoolYear";

// seasonalpart: zimski | letni
// vs -> vpisna številka (npr. 63240***)
export default function getUrnikFriUrl(seasonalPart: string, vs: number): string {
	const schoolYear = getCurrentSchoolYear();

	return `https://urnik.fri.uni-lj.si/timetable/fri-${schoolYear[0]}_${schoolYear[1]}-${seasonalPart}/allocations?student=${vs}`;
}
