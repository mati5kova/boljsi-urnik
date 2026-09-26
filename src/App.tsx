import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import Header, { type RefreshTimetableOptions } from "./components/header/Header";
import Timetable from "./components/timetable/Timetable";
import {
    _WAITING_RETRY_DELAY_IN_MS,
    defaultLecturesAuditoryAndLaboratoryExcersisesObject,
} from "./constants/Constants";
import {
    type LecturesAuditoryAndLaboratoryExcersises,
    type Season,
    useBoljsiUrnikContext,
} from "./context/BoljsiUrnikContext";
import { classifyOfficialTimetableChange } from "./functions/compareOfficialTimetables";
import getLecturesFromHTML from "./functions/getLecturesFromHTML";
import getNewDate from "./functions/getNewDate";
import getSchoolYearId, {
    getNextSchoolYearBoundary,
    getStoredSchoolYearId,
    hasOfficialLectures,
} from "./functions/getSchoolYearId";
import getUrnikFriUrl from "./functions/getUrnikFriUrl";
import { shouldFetchTimetable, shouldRetryWaitingTimetable } from "./functions/shouldFetchTimetable";
const _MAX_SCHOOL_YEAR_TIMER_DELAY_IN_MS = 24 * 60 * 60 * 1000;

type FetchStatus = "idle" | "loading" | "ready" | "waiting" | "error";

const createEmptyTimetable = (seasonId: Season, schoolYearId: string): LecturesAuditoryAndLaboratoryExcersises => ({
    ...defaultLecturesAuditoryAndLaboratoryExcersisesObject,
    seasonId,
    schoolYearId,
});

const getSchoolYearLabel = (schoolYearId: string) => schoolYearId.replace("_", "/");

export default function App() {
    const handledSharedRef = useRef(false); // prepreci dvojni alert v dev modu za malformed shared timetable url
    const activeRequestRef = useRef<{ requestId: number; identity: string; controller: AbortController } | null>(null);
    const requestSequenceRef = useRef(0);
    const lastAttemptAtRef = useRef(0);
    const previousStudentNumberRef = useRef<number | null>(null);
    const previousSeasonRef = useRef<Season | null>(null);
    const hasProcessedIdentityRef = useRef(false);
    const navigate = useNavigate();

    const {
        urnikFriSeasonalPartOfUrl,
        setUrnikFriSeasonalPartOfUrl,
        studentNumber,
        zimskiLecturesAuditoryAndLaboratoryExcersises,
        letniLecturesAuditoryAndLaboratoryExcersises,
        setZimskiLecturesAuditoryAndLaboratoryExcersises,
        setLetniLecturesAuditoryAndLaboratoryExcersises,
        zimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
        letniModifiedLecturesAuditoryAndLaboratoryExcersises,
        setLetniModifiedLecturesAuditoryAndLaboratoryExcersises,
        setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
        inEditMode,
        setInEditMode,
        setTemporaryAuditoryAndLaboratoryExcersises,
        setIsViewingASharedTimetable,
        setLockedLectureKey,
        lastActiveSchoolYearId,
        setLastActiveSchoolYearId,
    } = useBoljsiUrnikContext();

    const [urlParams] = useSearchParams();
    const sharedTimetable = urlParams.get("sharedTimetable");
    const hasUrlParameters = urlParams.size >= 1;
    const isSharedUrl = Boolean(sharedTimetable && hasUrlParameters);

    const [currentSchoolYearId, setCurrentSchoolYearId] = useState(() => getSchoolYearId());
    const [fetchStatus, setFetchStatus] = useState<FetchStatus>("idle");

    const currentLecturesData = useMemo(
        () =>
            urnikFriSeasonalPartOfUrl === "zimski"
                ? zimskiLecturesAuditoryAndLaboratoryExcersises
                : letniLecturesAuditoryAndLaboratoryExcersises,
        [
            urnikFriSeasonalPartOfUrl,
            zimskiLecturesAuditoryAndLaboratoryExcersises,
            letniLecturesAuditoryAndLaboratoryExcersises,
        ],
    );

    const storedCurrentSchoolYearId = getStoredSchoolYearId(currentLecturesData);
    const isWaitingForCurrentSchoolYear = Boolean(
        studentNumber &&
        (!hasOfficialLectures(currentLecturesData) || storedCurrentSchoolYearId !== currentSchoolYearId),
    );

    const latestIdentityRef = useRef({
        studentNumber,
        season: urnikFriSeasonalPartOfUrl,
        schoolYearId: currentSchoolYearId,
        isSharedUrl,
    });
    latestIdentityRef.current = {
        studentNumber,
        season: urnikFriSeasonalPartOfUrl,
        schoolYearId: currentSchoolYearId,
        isSharedUrl,
    };

    useEffect(() => {
        if (handledSharedRef.current) return;
        handledSharedRef.current = true;

        if (!isSharedUrl) {
            setIsViewingASharedTimetable(false);
            return;
        }

        try {
            const decoded = /%[0-9A-Fa-f]{2}/.test(sharedTimetable!)
                ? decodeURIComponent(sharedTimetable!)
                : sharedTimetable!;
            JSON.parse(decoded); // samo za potrebe validacije, pravi parsing in decoding se zgodi v <DayColumn> -> usememo
            setIsViewingASharedTimetable(true);
        } catch (err) {
            setIsViewingASharedTimetable(false);
            alert(err + "\n\n\nMalformed link of a shared timetable, redirecting to your timetable");
            navigate("/", { replace: true });
        }
    }, [sharedTimetable, isSharedUrl, setIsViewingASharedTimetable, navigate]);

    const refreshTimetable = useCallback(
        async (options: RefreshTimetableOptions = {}): Promise<boolean> => {
            const { force = false, reason = "automatic", skipComparison = false } = options;
            if (studentNumber == null || isSharedUrl) return false;

            const targetSeason = urnikFriSeasonalPartOfUrl;
            const targetSchoolYearId = currentSchoolYearId;
            const previousOfficial =
                targetSeason === "zimski"
                    ? zimskiLecturesAuditoryAndLaboratoryExcersises
                    : letniLecturesAuditoryAndLaboratoryExcersises;
            const otherOfficial =
                targetSeason === "zimski"
                    ? letniLecturesAuditoryAndLaboratoryExcersises
                    : zimskiLecturesAuditoryAndLaboratoryExcersises;
            const targetIsWaiting =
                !hasOfficialLectures(previousOfficial) ||
                getStoredSchoolYearId(previousOfficial) !== targetSchoolYearId;

            if (!force) {
                if (!shouldRetryWaitingTimetable(lastAttemptAtRef.current)) return false;
                if (!targetIsWaiting && !shouldFetchTimetable(previousOfficial)) return false;
            }

            lastAttemptAtRef.current = getNewDate().getTime();
            activeRequestRef.current?.controller.abort();

            const requestId = ++requestSequenceRef.current;
            const identity = `${studentNumber}|${targetSchoolYearId}|${targetSeason}`;
            const controller = new AbortController();
            activeRequestRef.current = { requestId, identity, controller };
            setFetchStatus("loading");

            const url = getUrnikFriUrl(targetSeason, studentNumber, undefined, targetSchoolYearId);
            if (!url) {
                setFetchStatus("error");
                activeRequestRef.current = null;
                return false;
            }

            const isStillCurrentRequest = () => {
                const latestIdentity = latestIdentityRef.current;
                return (
                    activeRequestRef.current?.requestId === requestId &&
                    activeRequestRef.current.identity === identity &&
                    latestIdentity.studentNumber === studentNumber &&
                    latestIdentity.schoolYearId === targetSchoolYearId &&
                    latestIdentity.season === targetSeason &&
                    !latestIdentity.isSharedUrl
                );
            };

            try {
                const response = await fetch(url, { signal: controller.signal });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

                const data = await response.text();
                const extractedLectures = getLecturesFromHTML(data, url, targetSeason, false, targetSchoolYearId);

                if (!isStillCurrentRequest()) return false; // zastarel odgovor ne sme prepisati nove identitete

                // Prazen parse pomeni, da personalizirani urnik še ni objavljen; zadnjega veljavnega ne prepišemo.
                if (!hasOfficialLectures(extractedLectures)) {
                    setFetchStatus("waiting");
                    return false;
                }

                const hasPreviousOfficial = hasOfficialLectures(previousOfficial) || hasOfficialLectures(otherOfficial);
                const isNewSchoolYear =
                    !skipComparison &&
                    [previousOfficial, otherOfficial].some(
                        (timetable) =>
                            hasOfficialLectures(timetable) && getStoredSchoolYearId(timetable) !== targetSchoolYearId,
                    );
                const change = skipComparison
                    ? "first"
                    : isNewSchoolYear
                      ? "new-school-year"
                      : classifyOfficialTimetableChange(previousOfficial, extractedLectures);

                if (targetSeason === "zimski") {
                    setZimskiLecturesAuditoryAndLaboratoryExcersises(extractedLectures);
                } else {
                    setLetniLecturesAuditoryAndLaboratoryExcersises(extractedLectures);
                }

                if (change === "new-school-year") {
                    // Prvi veljavni urnik novega leta invalidira oba semestra, da se podatki med leti ne mešajo.
                    if (targetSeason === "zimski") {
                        setLetniLecturesAuditoryAndLaboratoryExcersises(
                            createEmptyTimetable("letni", targetSchoolYearId),
                        );
                    } else {
                        setZimskiLecturesAuditoryAndLaboratoryExcersises(
                            createEmptyTimetable("zimski", targetSchoolYearId),
                        );
                    }
                    setLetniModifiedLecturesAuditoryAndLaboratoryExcersises(null);
                    setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises(null);
                    setTemporaryAuditoryAndLaboratoryExcersises(null);
                    setLockedLectureKey(null);
                    setInEditMode(false);

                    if (hasPreviousOfficial) {
                        alert(
                            `Objavljen je uradni urnik za ${getSchoolYearLabel(
                                targetSchoolYearId,
                            )}. Urniki prejšnjega leta in njihove prilagoditve so bili ponastavljeni.`,
                        );
                    }
                } else if (change === "changed") {
                    const hadModifiedTimetable =
                        targetSeason === "zimski"
                            ? zimskiModifiedLecturesAuditoryAndLaboratoryExcersises !== null
                            : letniModifiedLecturesAuditoryAndLaboratoryExcersises !== null;

                    if (targetSeason === "zimski") {
                        setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises(null);
                    } else {
                        setLetniModifiedLecturesAuditoryAndLaboratoryExcersises(null);
                    }
                    setTemporaryAuditoryAndLaboratoryExcersises(null);
                    setLockedLectureKey(null);

                    alert(
                        hadModifiedTimetable
                            ? `Uradni ${targetSeason} urnik se je spremenil. Prilagoditve tega semestra so bile ponastavljene.`
                            : `Uradni ${targetSeason} urnik se je spremenil. Prikazan je osvežen urnik.`,
                    );
                }

                setFetchStatus("ready");
                return true;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (error: any) {
                if (error.name !== "AbortError") {
                    console.error(`Error fetching timetable (${reason}):`, error);
                    if (isStillCurrentRequest()) setFetchStatus("error");
                }
                return false;
            } finally {
                if (activeRequestRef.current?.requestId === requestId) activeRequestRef.current = null;
            }
        },
        [
            studentNumber,
            isSharedUrl,
            urnikFriSeasonalPartOfUrl,
            currentSchoolYearId,
            zimskiLecturesAuditoryAndLaboratoryExcersises,
            letniLecturesAuditoryAndLaboratoryExcersises,
            zimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
            letniModifiedLecturesAuditoryAndLaboratoryExcersises,
            setZimskiLecturesAuditoryAndLaboratoryExcersises,
            setLetniLecturesAuditoryAndLaboratoryExcersises,
            setLetniModifiedLecturesAuditoryAndLaboratoryExcersises,
            setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
            setTemporaryAuditoryAndLaboratoryExcersises,
            setLockedLectureKey,
            setInEditMode,
        ],
    );

    useEffect(() => {
        if (lastActiveSchoolYearId === null) {
            const inferredSchoolYearId =
                [
                    getStoredSchoolYearId(zimskiLecturesAuditoryAndLaboratoryExcersises),
                    getStoredSchoolYearId(letniLecturesAuditoryAndLaboratoryExcersises),
                ].find((schoolYearId) => schoolYearId === currentSchoolYearId) ??
                getStoredSchoolYearId(zimskiLecturesAuditoryAndLaboratoryExcersises) ??
                getStoredSchoolYearId(letniLecturesAuditoryAndLaboratoryExcersises) ??
                (hasOfficialLectures(zimskiLecturesAuditoryAndLaboratoryExcersises) ||
                hasOfficialLectures(letniLecturesAuditoryAndLaboratoryExcersises)
                    ? "unknown"
                    : currentSchoolYearId);
            setLastActiveSchoolYearId(inferredSchoolYearId);
            return;
        }

        if (lastActiveSchoolYearId !== currentSchoolYearId) {
            setLastActiveSchoolYearId(currentSchoolYearId);
            setUrnikFriSeasonalPartOfUrl("zimski");
            setInEditMode(false);
            setTemporaryAuditoryAndLaboratoryExcersises(null);
            setLockedLectureKey(null);
            lastAttemptAtRef.current = 0;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSchoolYearId, lastActiveSchoolYearId]);

    useEffect(() => {
        if (lastActiveSchoolYearId !== currentSchoolYearId) return;

        const studentChanged = hasProcessedIdentityRef.current && previousStudentNumberRef.current !== studentNumber;
        const seasonChanged =
            previousSeasonRef.current !== null && previousSeasonRef.current !== urnikFriSeasonalPartOfUrl;

        if (studentChanged) {
            setZimskiLecturesAuditoryAndLaboratoryExcersises(createEmptyTimetable("zimski", currentSchoolYearId));
            setLetniLecturesAuditoryAndLaboratoryExcersises(createEmptyTimetable("letni", currentSchoolYearId));
            setLetniModifiedLecturesAuditoryAndLaboratoryExcersises(null);
            setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises(null);
            setTemporaryAuditoryAndLaboratoryExcersises(null);
            setLockedLectureKey(null);
            lastAttemptAtRef.current = 0;
        }

        if (seasonChanged) {
            setTemporaryAuditoryAndLaboratoryExcersises(null);
            setLockedLectureKey(null);
        }

        previousStudentNumberRef.current = studentNumber;
        previousSeasonRef.current = urnikFriSeasonalPartOfUrl;
        hasProcessedIdentityRef.current = true;

        if (studentNumber == null || isSharedUrl) {
            activeRequestRef.current?.controller.abort();
            return;
        }

        const force =
            studentChanged ||
            !hasOfficialLectures(currentLecturesData) ||
            getStoredSchoolYearId(currentLecturesData) !== currentSchoolYearId;
        void refreshTimetable({
            force,
            reason: studentChanged ? "student-change" : "identity-change",
            skipComparison: studentChanged,
        });
        // Fetch se sproži samo ob spremembi identitete, ne ob vsakem zapisu svežih podatkov.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentNumber, urnikFriSeasonalPartOfUrl, currentSchoolYearId, lastActiveSchoolYearId, isSharedUrl]);

    useEffect(() => {
        const checkCurrentSchoolYear = () => setCurrentSchoolYearId(getSchoolYearId());
        let timeout: number;
        const scheduleBoundaryCheck = () => {
            const nextBoundary = getNextSchoolYearBoundary();
            const delay = Math.min(
                nextBoundary.getTime() - getNewDate().getTime() + 100,
                _MAX_SCHOOL_YEAR_TIMER_DELAY_IN_MS,
            );
            timeout = window.setTimeout(() => {
                checkCurrentSchoolYear();
                scheduleBoundaryCheck();
            }, delay);
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") checkCurrentSchoolYear();
        };

        scheduleBoundaryCheck();
        window.addEventListener("focus", checkCurrentSchoolYear);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            window.clearTimeout(timeout);
            window.removeEventListener("focus", checkCurrentSchoolYear);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [currentSchoolYearId]);

    useEffect(() => {
        if (studentNumber == null || isSharedUrl || lastActiveSchoolYearId !== currentSchoolYearId) return;

        const refreshOnFocus = () => {
            if (document.visibilityState === "visible") {
                void refreshTimetable({ reason: isWaitingForCurrentSchoolYear ? "waiting-retry" : "focus" });
            }
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") refreshOnFocus();
        };
        const interval = isWaitingForCurrentSchoolYear
            ? window.setInterval(refreshOnFocus, _WAITING_RETRY_DELAY_IN_MS)
            : null;

        window.addEventListener("focus", refreshOnFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => {
            if (interval !== null) window.clearInterval(interval);
            window.removeEventListener("focus", refreshOnFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [
        studentNumber,
        isSharedUrl,
        isWaitingForCurrentSchoolYear,
        currentSchoolYearId,
        lastActiveSchoolYearId,
        urnikFriSeasonalPartOfUrl,
        refreshTimetable,
    ]);

    useEffect(
        () => () => {
            activeRequestRef.current?.controller.abort();
        },
        [],
    );

    useEffect(() => {
        if (!inEditMode) {
            setTemporaryAuditoryAndLaboratoryExcersises(null);
            setLockedLectureKey(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inEditMode]);

    const timetableStatusMessage = useMemo(() => {
        if (!studentNumber || isSharedUrl || !isWaitingForCurrentSchoolYear) return null;
        const currentLabel = getSchoolYearLabel(currentSchoolYearId);
        if (hasOfficialLectures(currentLecturesData)) {
            const previousLabel = storedCurrentSchoolYearId
                ? getSchoolYearLabel(storedCurrentSchoolYearId)
                : "neznano šolsko leto";
            return `Urnik za ${currentLabel} še ni na voljo. Prikazan je zadnji veljavni urnik za ${previousLabel}.`;
        }
        return `Urnik za ${currentLabel} še ni na voljo.`;
    }, [
        studentNumber,
        isSharedUrl,
        isWaitingForCurrentSchoolYear,
        currentSchoolYearId,
        currentLecturesData,
        storedCurrentSchoolYearId,
    ]);

    return (
        <>
            <Header
                refreshTimetable={refreshTimetable}
                schoolYearId={currentSchoolYearId}
                timetableStatusMessage={timetableStatusMessage}
                isTimetableReadOnly={isWaitingForCurrentSchoolYear}
                fetchStatus={fetchStatus}
            />
            <Timetable />
        </>
    );
}
