import { useEffect, useRef } from "react";
import Header from "./components/header/Header";
import Timetable from "./components/timetable/Timetable";
import { _DELAY_IN_DAYS_TO_WAIT_BEFORE_ANOTHER_FETCH } from "./constants/Constants";
import { useBoljsiUrnikContext } from "./context/BoljsiUrnikContext";
import getDifferenceBetween2Dates from "./functions/getDifferenceBetween2Dates";
import getLecturesFromHTML from "./functions/getLecturesFromHTML";
import getNewDate from "./functions/getNewDate";
import getUrnikFriUrl from "./functions/getUrnikFriUrl";

export default function App() {
	const isInitialMount = useRef(true);

	const {
		urnikFriSeasonalPartOfUrl,
		studentNumber,
		lecturesAuditoryAndLaboratoryExcersises,
		setLecturesAuditoryAndLaboratoryExcersises,
	} = useBoljsiUrnikContext();

	const fetchTimetableFromUrnikFRI = async (url: string, controller: AbortController) => {
		if (!url) {
			console.error("Error: Provided URL is invalid or empty.");
			return;
		}

		try {
			const response = await fetch(url, { signal: controller.signal });
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			} else {
				const data = await response.text();
				const extractedLectures = getLecturesFromHTML(data, url, urnikFriSeasonalPartOfUrl);
				setLecturesAuditoryAndLaboratoryExcersises(extractedLectures);
				console.log(extractedLectures);
			}

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			if (error.name === "AbortError") {
				console.log("Fetch aborted: Component unmounted or request cancelled.");
			} else {
				console.error("Error fetching timetable:", error);
			}
		}
	};

	useEffect(() => {
		const controller = new AbortController();
		const url = getUrnikFriUrl(urnikFriSeasonalPartOfUrl, studentNumber);

		// obnošanje v developmentu je še vedno napačno zaradi React.StrictMode ki povzroči 2x render
		if (isInitialMount.current) {
			isInitialMount.current = false; // ni več prvi render
			// fetchej samo če je minilo X dni/ur
			if (
				getDifferenceBetween2Dates(
					getNewDate(),
					lecturesAuditoryAndLaboratoryExcersises.dateOfRequest,
					"days"
				) > _DELAY_IN_DAYS_TO_WAIT_BEFORE_ANOTHER_FETCH
			) {
				fetchTimetableFromUrnikFRI(url, controller);
			}
		} else {
			// vedno fetchej na drugih renderjih
			fetchTimetableFromUrnikFRI(url, controller);
		}

		return () => {
			controller.abort();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [studentNumber, urnikFriSeasonalPartOfUrl]);

	return (
		<>
			<Header />
			<Timetable />
		</>
	);
}
