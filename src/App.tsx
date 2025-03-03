import { useEffect, useRef } from "react";
import Header from "./components/header/Header";
import Timetable from "./components/timetable/Timetable";
import { defaultLecturesAuditoryAndLaboratoryExcersisesObject } from "./constants/Constants";
import { useBoljsiUrnikContext } from "./context/BoljsiUrnikContext";
import getLecturesFromHTML from "./functions/getLecturesFromHTML";
import getUrnikFriUrl from "./functions/getUrnikFriUrl";
import { shouldFetchTimetable } from "./functions/shouldFetchTimetable";

export default function App() {
	const isInitialMount = useRef(true); // initial mount za letni/zimski fetch
	const isInitialMountTwo = useRef(true); // initial mount za vpisno številko fetch

	const {
		urnikFriSeasonalPartOfUrl,
		studentNumber,
		zimskiLecturesAuditoryAndLaboratoryExcersises,
		letniLecturesAuditoryAndLaboratoryExcersises,
		setZimskiLecturesAuditoryAndLaboratoryExcersises,
		setLetniLecturesAuditoryAndLaboratoryExcersises,
		setLetniModifiedLecturesAuditoryAndLaboratoryExcersises,
		setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
		inEditMode,
		setTemporaryAuditoryAndLaboratoryExcersises,
	} = useBoljsiUrnikContext();

	// funkcija za fetch in nastavitev base urnika glede na semester
	// passano tudi v Header.tsx -> reset timetable
	const fetchTimetableFromUrnikFRI = async (url: string, controller: AbortController) => {
		if (!url) {
			console.error("Error: Provided URL is invalid or empty.");
			return;
		}
		try {
			const response = await fetch(url, { signal: controller.signal });
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.text();
			const extractedLectures = getLecturesFromHTML(data, url, urnikFriSeasonalPartOfUrl, false);

			// izberi lokacijo glede na semester
			if (urnikFriSeasonalPartOfUrl === "zimski") {
				setZimskiLecturesAuditoryAndLaboratoryExcersises(extractedLectures);
			} else if (urnikFriSeasonalPartOfUrl === "letni") {
				setLetniLecturesAuditoryAndLaboratoryExcersises(extractedLectures);
			}
			// izpis za DEV
			// console.log(extractedLectures);

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.name === "AbortError") {
				console.log("Fetch aborted: Component unmounted or request cancelled.");
			} else {
				console.error("Error fetching timetable:", error);
			}
		}
	};

	// useEffect ki runna ko se spremeni semester
	useEffect(() => {
		if (studentNumber == null) return;

		const controller = new AbortController();
		const url = getUrnikFriUrl(urnikFriSeasonalPartOfUrl, studentNumber);

		// izberi pravilni objekt glede na semester
		const lecturesData =
			urnikFriSeasonalPartOfUrl === "zimski"
				? zimskiLecturesAuditoryAndLaboratoryExcersises
				: letniLecturesAuditoryAndLaboratoryExcersises;

		// fetchej SAMO če je minilo dovolj časa od _DELAY_IN_DAYS_TO_WAIT_BEFORE_ANOTHER_FETCH
		if (lecturesData && shouldFetchTimetable(lecturesData)) {
			fetchTimetableFromUrnikFRI(url, controller);
		}

		isInitialMount.current = false;

		return () => {
			controller.abort();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [urnikFriSeasonalPartOfUrl]);

	// useEffect ki runna ko uporabnik spremeni vpisno številko
	// ideja za tem je da je to primarno za to če se uporabnik prvič zatipka ali kaj podobnega
	// apllikacija dne 2.3.2025 ne podpira večih modified urnikov na isti napravi/istem local storagu
	useEffect(() => {
		const controller = new AbortController();
		const url = getUrnikFriUrl(urnikFriSeasonalPartOfUrl, studentNumber);

		if (isInitialMountTwo.current) {
			isInitialMountTwo.current = false;
		} else {
			// nujno nastavimo vse na default prazen object ker se je spremenila vpisna številka
			// drugače se ko spremenimo vpisno številko updejta samo npr. urnik za letni semester in ko switchamo
			// na zimski semester in NI minilo dovolj časa od zanjega fetcha, še vedno prikaže od prejšnje vpisne številke urnik
			setZimskiLecturesAuditoryAndLaboratoryExcersises(defaultLecturesAuditoryAndLaboratoryExcersisesObject);
			setLetniLecturesAuditoryAndLaboratoryExcersises(defaultLecturesAuditoryAndLaboratoryExcersisesObject);
			setLetniModifiedLecturesAuditoryAndLaboratoryExcersises(null);
			setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises(null);

			fetchTimetableFromUrnikFRI(url, controller);
		}

		return () => {
			controller.abort();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [studentNumber]);

	useEffect(() => {
		// če nismo v edit modu moremo clearat in nastavit temp vaje na null (da se ne renderajo še vedno v DayColumn.tsx)
		if (inEditMode == false) {
			setTemporaryAuditoryAndLaboratoryExcersises(null);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inEditMode]);

	return (
		<>
			<Header fetchTimetableFromUrnikFRI={fetchTimetableFromUrnikFRI} />
			<Timetable />
		</>
	);
}
