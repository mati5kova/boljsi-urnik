import { useBoljsiUrnikContext } from "../../../context/BoljsiUrnikContext";
import "./SeasonSwitch.css";

export default function SeasonSwitch() {
	const { urnikFriSeasonalPartOfUrl, setUrnikFriSeasonalPartOfUrl } = useBoljsiUrnikContext();

	return (
		<div className="switch-container">
			<div className="season-switch">
				<div className="toggle" style={{ left: urnikFriSeasonalPartOfUrl === "zimski" ? "0%" : "50%" }} />
				<button
					className={`switch-button ${urnikFriSeasonalPartOfUrl === "zimski" ? "active" : ""}`}
					onClick={() => {
						setUrnikFriSeasonalPartOfUrl("zimski");
					}}
				>
					zimski
				</button>
				<button
					className={`switch-button ${urnikFriSeasonalPartOfUrl === "letni" ? "active" : ""}`}
					onClick={() => {
						setUrnikFriSeasonalPartOfUrl("letni");
					}}
				>
					letni
				</button>
			</div>
		</div>
	);
}
