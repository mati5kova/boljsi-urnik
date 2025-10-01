import { useState } from "react";
import { useBoljsiUrnikContext } from "../../../context/BoljsiUrnikContext";
import "./StudentNumberInput.css";

export default function StudentNumberInput() {
	const { studentNumber, setStudentNumber } = useBoljsiUrnikContext();
	const [localStudentNumber, setLocalStudentNumber] = useState<string>(studentNumber ? String(studentNumber) : "");

	const isEigthDigitNumber = (num: number | string) => {
		return /^\d{8}$/.test(String(num));
	};

	const handleStudentNumberInputSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!isNaN(Number(localStudentNumber)) && isEigthDigitNumber(localStudentNumber)) {
			setStudentNumber(Number(localStudentNumber));
		}
	};

	return (
		<form className="student-number-input" onSubmit={(e) => handleStudentNumberInputSubmit(e)}>
			<label htmlFor="student-id">Vpisna številka:</label>
			<input
				id="student-id"
				type="text"
				value={localStudentNumber || ""}
				onChange={(e) => {
					setLocalStudentNumber(e.target.value);
				}}
				placeholder="npr. 63240123"
			/>
		</form>
	);
}
