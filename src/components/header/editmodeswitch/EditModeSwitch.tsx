import { useBoljsiUrnikContext } from "../../../context/BoljsiUrnikContext";
import "./EditModeSwitch.css";

export default function EditModeSwitch() {
	const { inEditMode, setInEditMode } = useBoljsiUrnikContext();

	return (
		<div className="edit-mode-switch">
			<label className="switch">
				<input type="checkbox" checked={inEditMode} onChange={() => setInEditMode(!inEditMode)} />
				<span className="slider" />
			</label>
			<span>{inEditMode ? "Urejanje omogočeno" : "Urejanje onemogočeno"}</span>
		</div>
	);
}
