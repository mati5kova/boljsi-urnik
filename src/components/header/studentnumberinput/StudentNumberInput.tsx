import { useState } from "react";
import { useBoljsiUrnikContext } from "../../../context/BoljsiUrnikContext";
import "./StudentNumberInput.css";

export default function StudentNumberInput() {
	const { studentNumber, setStudentNumber } = useBoljsiUrnikContext();
	const [localStudentNumber, setLocalStudentNumber] = useState<number>(studentNumber);

	const isEigthDigitNumber = (num: number | string) => {
		return /^\d{8}$/.test(String(num));
	};

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		// preven default logično
		e.preventDefault();
		if (!isNaN(localStudentNumber) && isEigthDigitNumber(localStudentNumber)) {
			setStudentNumber(localStudentNumber);
		}
	};

	return (
		<div className="student-number-form-container">
			<form className="student-number-input-container" onSubmit={handleSubmit}>
				<input
					type="number"
					placeholder="Vpisna številka"
					className="student-number-input"
					onChange={(e) => {
						const newValue: number = e.target.valueAsNumber;
						if (!isNaN(newValue) && isEigthDigitNumber(newValue)) {
							setLocalStudentNumber(newValue);
						}
					}}
					defaultValue={studentNumber}
				/>
				<button type="submit" className="student-number-submit">
					SUBMIT
				</button>
			</form>
		</div>
	);
}
