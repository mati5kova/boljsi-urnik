import { useBoljsiUrnikContext } from "../../context/BoljsiUrnikContext";
import getCurrentSchoolYear from "../../functions/getCurrentSchoolYear";
import "./Header.css";
import SeasonSwitch from "./seasonswitch/SeasonSwitch";

export default function Header() {
	const schoolYear = getCurrentSchoolYear();

	const { urnikFriSeasonalPartOfUrl } = useBoljsiUrnikContext();

	return (
		<div className="header">
			<div>
				<span className="title">
					{`FRI ${schoolYear[0]}/${schoolYear[1]}, ${urnikFriSeasonalPartOfUrl} semester`}
				</span>
				<br />
				<span>VŠ</span>
			</div>

			<SeasonSwitch />
		</div>
	);
}
