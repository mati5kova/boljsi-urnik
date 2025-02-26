import { createContext, ReactNode, useContext } from "react";
import { defaultLecturesAuditoryAndLaboratoryExcersisesObject } from "../constants/Constants";
import getNewDate from "../functions/getNewDate";
import useLocalStorage from "../hooks/useLocalStorage";

export type Season = "letni" | "zimski";
export const currentMonth: number = getNewDate().getMonth() + 1; //0-index based -> JAN:0

export interface IndividualLectureAuditoryOrLaboratoryExcerise {
	gridPosition: string;
	gridArea: string;
	lectureName: string;
    lectureBackgroundColor: string;
	lectureNameHref: string;
	classType: string;
	classroom: string;
	professor: string;
	groups: string[];
}

export interface LecturesAuditoryAndLaboratoryExcersises {
	dateOfRequest: Date;
	lecturesP: IndividualLectureAuditoryOrLaboratoryExcerise[];
	lecturesAV: IndividualLectureAuditoryOrLaboratoryExcerise[];
	lecturesLV: IndividualLectureAuditoryOrLaboratoryExcerise[];
}

interface BoljsiUrnikContextType {
	urnikFriSeasonalPartOfUrl: Season;
	setUrnikFriSeasonalPartOfUrl: (value: Season) => void;

	//vpisna številka
	studentNumber: number;
	setStudentNumber: (value: number) => void;

	lecturesAuditoryAndLaboratoryExcersises: LecturesAuditoryAndLaboratoryExcersises;
	setLecturesAuditoryAndLaboratoryExcersises: (value: LecturesAuditoryAndLaboratoryExcersises) => void;
}

// context z initial value = undefined
const BoljsiUrnikContext = createContext<BoljsiUrnikContextType | undefined>(undefined);

// provider's props
interface BoljsiUrnikProviderProps {
	children: ReactNode;
}

// provider komponenta
export const BoljsiUrnikProvider = ({ children }: BoljsiUrnikProviderProps) => {
	// zimski je default value
	const [urnikFriSeasonalPartOfUrl, setUrnikFriSeasonalPartOfUrl] = useLocalStorage(
		"seasonalPartOfUrl",
		[10, 11, 12, 1].includes(currentMonth) ? "zimski" : "letni"
	); //10, 11, 12, 1 so meseci oktober, november, december, januar -> meseci zimskega semestra

	const [studentNumber, setStudentNumber] = useLocalStorage("studentNumber", 12345678);
	const [lecturesAuditoryAndLaboratoryExcersises, setLecturesAuditoryAndLaboratoryExcersises] = useLocalStorage(
		"lecturesAuditoryAndLaboratoryExcersises",
		defaultLecturesAuditoryAndLaboratoryExcersisesObject
	);

	return (
		<BoljsiUrnikContext.Provider
			value={{
				urnikFriSeasonalPartOfUrl,
				setUrnikFriSeasonalPartOfUrl,
				studentNumber,
				setStudentNumber,
				lecturesAuditoryAndLaboratoryExcersises,
				setLecturesAuditoryAndLaboratoryExcersises,
			}}
		>
			{children}
		</BoljsiUrnikContext.Provider>
	);
};

// hook za consumat context
// eslint-disable-next-line react-refresh/only-export-components
export const useBoljsiUrnikContext = () => {
	const context = useContext(BoljsiUrnikContext);
	if (context === undefined) {
		throw new Error("useBoljsiUrnikContext must be used within a BoljsiUrnikProvider");
	}
	return context;
};
