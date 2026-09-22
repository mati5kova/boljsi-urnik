import { _DELAY_IN_DAYS_TO_WAIT_BEFORE_ANOTHER_FETCH, _WAITING_RETRY_DELAY_IN_MS } from "../constants/Constants";
import getDifferenceBetween2Dates from "../functions/getDifferenceBetween2Dates";
import getNewDate from "../functions/getNewDate";

// vrne true če je razlika v dneh od danes in zadnjega fetcha večja od konstante
export function shouldFetchTimetable(lecturesData: { dateOfRequest: Date }): boolean {
    const dateOfRequest = new Date(lecturesData.dateOfRequest);
    if (Number.isNaN(dateOfRequest.getTime()) || dateOfRequest.getTime() > getNewDate().getTime()) return true;

    return (
        getDifferenceBetween2Dates(getNewDate(), dateOfRequest, "days") >= _DELAY_IN_DAYS_TO_WAIT_BEFORE_ANOTHER_FETCH
    );
}

export function shouldRetryWaitingTimetable(lastAttemptAt: number, now: number = getNewDate().getTime()): boolean {
    return lastAttemptAt === 0 || now - lastAttemptAt >= _WAITING_RETRY_DELAY_IN_MS;
}
