import { useState } from "react";
import { useBoljsiUrnikContext } from "../../../context/BoljsiUrnikContext";
import "./StudentNumberInput.css";

export default function StudentNumberInput() {
	const { studentNumber, setStudentNumber } = useBoljsiUrnikContext();
	const [localStudentNumber, setLocalStudentNumber] = useState<number>(studentNumber);

	const isEigthDigitNumber = (num: number | string) => {
		return /^\d{8}$/.test(String(num));
	};

	return (
		<div className="student-number-input-container">
			<input
				type="number"
				placeholder="Vpisna številka"
				className="student-number-input"
				onChange={(e) => {
					const newValue: number = e.target.valueAsNumber;

					if (!isNaN(newValue) && isEigthDigitNumber(newValue)) {
						console.log(newValue);
						setLocalStudentNumber(newValue);
					}
				}}
				defaultValue={studentNumber}
			></input>
			<button
				type="submit"
				onClick={() => {
					if (!isNaN(localStudentNumber) && isEigthDigitNumber(localStudentNumber)) {
						setStudentNumber(localStudentNumber);
					}
				}}
				className="student-number-submit"
			>
				SUBMIT
			</button>
		</div>
	);
}
