import { Season, useBoljsiUrnikContext } from "../../../context/BoljsiUrnikContext";
import "./SeasonSwitch.css";

export default function SeasonSwitch() {
	const { urnikFriSeasonalPartOfUrl, setUrnikFriSeasonalPartOfUrl } = useBoljsiUrnikContext();

	return (
		<div className="season-switch">
			<label>Semester:</label>
			<select
				value={urnikFriSeasonalPartOfUrl}
				onChange={(e) => setUrnikFriSeasonalPartOfUrl(e.target.value as Season)}
			>
				<option value="letni">Letni</option>
				<option value="zimski">Zimski</option>
			</select>
		</div>
	);
}
