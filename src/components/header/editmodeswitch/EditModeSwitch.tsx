import { useBoljsiUrnikContext } from "../../../context/BoljsiUrnikContext";
import "./EditModeSwitch.css";

interface EditModeSwitchProps {
    disabled?: boolean;
}

export default function EditModeSwitch({ disabled = false }: EditModeSwitchProps) {
    const { inEditMode, setInEditMode } = useBoljsiUrnikContext();

    return (
        <div className="edit-mode-switch">
            <label className="switch">
                <input
                    type="checkbox"
                    checked={inEditMode}
                    disabled={disabled}
                    onChange={() => setInEditMode(!inEditMode)}
                />
                <span className="slider" />
            </label>
            <span>
                {disabled
                    ? "Urejanje ni na voljo za stari urnik"
                    : inEditMode
                      ? "Urejanje omogočeno"
                      : "Urejanje onemogočeno"}
            </span>
        </div>
    );
}
