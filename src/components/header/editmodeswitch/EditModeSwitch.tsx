import { useBoljsiUrnikContext } from "../../../context/BoljsiUrnikContext";
import "./EditModeSwitch.css";

export default function EditModeSwitch() {
	const { inEditMode, setInEditMode, setTemporaryAuditoryAndLaboratoryExcersises } = useBoljsiUrnikContext();

	return (
		<div className="switch-container">
			<div className="season-switch edit-mode-switch">
				<div className="toggle" style={{ left: inEditMode ? "50%" : "0%" }} />
				<button className={`switch-button ${!inEditMode ? "active" : ""}`} onClick={() => setInEditMode(false)}>
					pregled
				</button>
				<button
					className={`switch-button ${inEditMode ? "active" : ""}`}
					onClick={() => {
						// to je da če smo inEditMode in pritisnemo še enkrat na urejanje
						//      se temp zadeve clearajo (po predlogu od gašperja)
						if (inEditMode) {
							setTemporaryAuditoryAndLaboratoryExcersises(null);
						} else {
							setInEditMode(true);
						}
					}}
				>
					urejanje
				</button>
			</div>
		</div>
	);
}
