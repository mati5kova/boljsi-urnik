//vrne razliko med dvemi datumi v urah
export default function getDifferenceBetween2Dates(first: Date, second: Date, format: "days" | "hours"): number {
	const firstTime = new Date(first).getTime();
	const secondTime = new Date(second).getTime();

	if (format === "days") {
		return Math.abs((secondTime - firstTime) / 1000 / 60 / 60 / 24);
	} else if (format === "hours") {
		return Math.abs((secondTime - firstTime) / 1000 / 60 / 60);
	}

	return 0;
}
