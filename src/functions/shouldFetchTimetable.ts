import { _DELAY_IN_DAYS_TO_WAIT_BEFORE_ANOTHER_FETCH } from "../constants/Constants";
import getDifferenceBetween2Dates from "../functions/getDifferenceBetween2Dates";
import getNewDate from "../functions/getNewDate";

// vrne true če je razlika v dneh od danes in zadnjega fetcha večja od konstante
export function shouldFetchTimetable(lecturesData: { dateOfRequest: Date }): boolean {
	return (
		getDifferenceBetween2Dates(getNewDate(), lecturesData.dateOfRequest, "days") >
		_DELAY_IN_DAYS_TO_WAIT_BEFORE_ANOTHER_FETCH
	);
}
