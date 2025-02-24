import { useEffect, useState } from "react";
import SeasonSwitch from "./components/seasonswitch/SeasonSwitch";
import Timetable from "./components/timetable/Timetable";
import getUrnikFriUrl from "./functions/getUrnikFriUrl";
import useLocalStorage from "./hooks/useLocalStorage";

export type Season = "letni" | "zimski" | undefined;

export default function App() {
	//const [urnikFriSeasonalPartOfUrl, setUrnikFriSeasonalPartOfUrl] = useState<Season>();
	const [urnikFriSeasonalPartOfUrl, setUrnikFriSeasonalPartOfUrl] = useLocalStorage("", null);

	useEffect(() => {
		const fetchTimetableFromUrnikFRI = (url: string) => {};
	}, []);

	return (
		<>
			<SeasonSwitch
				urnikFriSeasonalPartOfUrl={urnikFriSeasonalPartOfUrl}
				setUrnikFriSeasonalPartOfUrl={setUrnikFriSeasonalPartOfUrl}
			/>
			{getUrnikFriUrl(urnikFriSeasonalPartOfUrl, 63240167)}
			<Timetable />
		</>
	);
}
