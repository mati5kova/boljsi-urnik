import { createContext, ReactNode, useContext, useState } from "react";
import { defaultLecturesAuditoryAndLaboratoryExcersisesObject } from "../constants/Constants";
import getNewDate from "../functions/getNewDate";
import useLocalStorage from "../hooks/useLocalStorage";

export type Season = "letni" | "zimski";
export const _CURRENT_MONTH: number = getNewDate().getMonth() + 1; //0-index based -> JAN:0

export interface IndividualLectureAuditoryOrLaboratoryExcerise {
	// pozicija v grid layoutu (vrstica x razteg): npr. (grid-row: )9 / span 2;
	// css property grid-row se dejansko ne shrani
	gridPosition: string;

	// gridArea v grid layoutu (stolpci): npr. dayMON, dayTUE, ...
	gridArea: string;

	// ime predmeta/vaj/...
	lectureName: string;

	// backgroundColor: npr. (background-color: )rgb(0, 208, 239)
	// dejansko se shrani samo rgb/rgba/... vrednost brez css property-ja
	lectureBackgroundColor: string;

	// npr. ?subject=63278 ki se uporabi pri getUrnikFriUrl(_, _, subject?:string)
	// treba za fetchat in parsat vaje ki jih dobimo s pritiskom edit simbola v Lecture.tsx
	lectureNameHref: string;

	// P | AV | LV
	classType: string;

	// predavalnica
	classroom: string;

	// izvajalec predmeta
	professor: string;

	// skupine na dnu predmeta npr. 1_BUN_RI, 63215_PAD...
	groups: string[];

	// property je pomemben za renderanje stvar predvsem v Lecture.tsx
	// temporaryAuditoryAndLaboratoryExcersises IMAJO isTemporaryAndShouldBeTreatedAsSuch=true
	// lecturesAuditoryAndLaboratoryExcersises in modifiedLecturesAuditoryAndLaboratoryExcersises imajo isTemporaryAndShouldBeTreatedAsSuch=false
	isTemporaryAndShouldBeTreatedAsSuch: boolean;
}

export interface LecturesAuditoryAndLaboratoryExcersises {
	// zimski | letni
	seasonId: Season;

	// datum zadnjega oz. tega requesta -> uporablja se za preverjanje ali je minilo dovlj časa od zadnjega fetcha
	dateOfRequest: Date;

	// seznami parsanih predavanj in vaj
	lecturesP: IndividualLectureAuditoryOrLaboratoryExcerise[];
	lecturesAV: IndividualLectureAuditoryOrLaboratoryExcerise[];
	lecturesLV: IndividualLectureAuditoryOrLaboratoryExcerise[];
}

interface BoljsiUrnikContextType {
	//in edit mode: true | false
	inEditMode: boolean;
	setInEditMode: (value: boolean) => void;

	// zimski | letni
	urnikFriSeasonalPartOfUrl: Season;
	setUrnikFriSeasonalPartOfUrl: (value: Season) => void;

	// vpisna številka
	studentNumber: number;
	setStudentNumber: (value: number) => void;

	// predavanje in vaje fetchane v App.tsx (useEffect hook)
	// ločeno po semestru
	letniLecturesAuditoryAndLaboratoryExcersises: LecturesAuditoryAndLaboratoryExcersises;
	setLetniLecturesAuditoryAndLaboratoryExcersises: (value: LecturesAuditoryAndLaboratoryExcersises) => void;
	zimskiLecturesAuditoryAndLaboratoryExcersises: LecturesAuditoryAndLaboratoryExcersises;
	setZimskiLecturesAuditoryAndLaboratoryExcersises: (value: LecturesAuditoryAndLaboratoryExcersises) => void;

	// predavanja in vaje, ki jih uporabnik spremeni
	letniModifiedLecturesAuditoryAndLaboratoryExcersises: LecturesAuditoryAndLaboratoryExcersises | null;
	setLetniModifiedLecturesAuditoryAndLaboratoryExcersises: (
		value: LecturesAuditoryAndLaboratoryExcersises | null
	) => void;
	zimskiModifiedLecturesAuditoryAndLaboratoryExcersises: LecturesAuditoryAndLaboratoryExcersises | null;
	setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises: (
		value: LecturesAuditoryAndLaboratoryExcersises | null
	) => void;

	// temp za neke vaje ko jih želi uporabnik zamenjat
	// npr. ko pritisne uporabnik na <settings icon> se fetchajo vsi tisti predmeti, in so nato shranjeni tukaj
	// vaje znotraj tega so renderane v DayColumn.tsx -> defaultane na []
	temporaryAuditoryAndLaboratoryExcersises: LecturesAuditoryAndLaboratoryExcersises | null;
	setTemporaryAuditoryAndLaboratoryExcersises: (value: LecturesAuditoryAndLaboratoryExcersises | null) => void;
}

// context z initial value = undefined
const BoljsiUrnikContext = createContext<BoljsiUrnikContextType | undefined>(undefined);

// provider's props
interface BoljsiUrnikProviderProps {
	children: ReactNode;
}

// provider komponenta
export const BoljsiUrnikProvider = ({ children }: BoljsiUrnikProviderProps) => {
	// false je default value
	// po gašperjevem predlogu naj se ne shrani v localStorage -> bolje če je nov visit na stran v pregled načinu
	const [inEditMode, setInEditMode] = useState(false);

	// zimski je default value
	const [urnikFriSeasonalPartOfUrl, setUrnikFriSeasonalPartOfUrl] = useLocalStorage(
		"seasonalPartOfUrl",
		[9, 10, 11, 12, 1].includes(_CURRENT_MONTH) ? "zimski" : "letni"
	); //9, 10, 11, 12, 1 so meseci september, oktober, november, december, januar -> meseci zimskega semestra

	// vpisna številka
	const [studentNumber, setStudentNumber] = useLocalStorage("studentNumber", null);

	// base urnik po semestru
	const [zimskiLecturesAuditoryAndLaboratoryExcersises, setZimskiLecturesAuditoryAndLaboratoryExcersises] =
		useLocalStorage(
			"zimskiLecturesAuditoryAndLaboratoryExcersises",
			defaultLecturesAuditoryAndLaboratoryExcersisesObject
		);
	const [letniLecturesAuditoryAndLaboratoryExcersises, setLetniLecturesAuditoryAndLaboratoryExcersises] =
		useLocalStorage(
			"letniLecturesAuditoryAndLaboratoryExcersises",
			defaultLecturesAuditoryAndLaboratoryExcersisesObject
		);

	// modified urnik po semestru
	const [
		zimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
		setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
	] = useLocalStorage("zimskiModifiedLecturesAuditoryAndLaboratoryExcersises", null);
	const [
		letniModifiedLecturesAuditoryAndLaboratoryExcersises,
		setLetniModifiedLecturesAuditoryAndLaboratoryExcersises,
	] = useLocalStorage("letniModifiedLecturesAuditoryAndLaboratoryExcersises", null);

	// temp vaje za izbrat
	const [temporaryAuditoryAndLaboratoryExcersises, setTemporaryAuditoryAndLaboratoryExcersises] = useLocalStorage(
		"temporaryAuditoryAndLaboratoryExcersises",
		null
	);

	return (
		<BoljsiUrnikContext.Provider
			value={{
				inEditMode,
				setInEditMode,
				urnikFriSeasonalPartOfUrl,
				setUrnikFriSeasonalPartOfUrl,
				studentNumber,
				setStudentNumber,
				zimskiLecturesAuditoryAndLaboratoryExcersises,
				setZimskiLecturesAuditoryAndLaboratoryExcersises,
				letniLecturesAuditoryAndLaboratoryExcersises,
				setLetniLecturesAuditoryAndLaboratoryExcersises,
				zimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
				setZimskiModifiedLecturesAuditoryAndLaboratoryExcersises,
				letniModifiedLecturesAuditoryAndLaboratoryExcersises,
				setLetniModifiedLecturesAuditoryAndLaboratoryExcersises,
				temporaryAuditoryAndLaboratoryExcersises,
				setTemporaryAuditoryAndLaboratoryExcersises,
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
