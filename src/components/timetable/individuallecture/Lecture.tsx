import { IndividualLectureAuditoryOrLaboratoryExcerise } from "../../../context/BoljsiUrnikContext";
import "./Lecture.css";
import LectureDescription from "./LectureDescription";

export default function Lecture(laale: IndividualLectureAuditoryOrLaboratoryExcerise) {
	return (
		<>
			{/* 
                če je temp lecture mora biti ovito v overlay-to-select-lecture + rabimo dat gridRow property
                ker prikaz ni pravilen če ni na najbolj visokem div-u 
            */}
			{laale.isTemporaryAndShouldBeTreatedAsSuch ? (
				<div className="overlay-to-select-lecture" style={{ cursor: "pointer", gridRow: laale.gridPosition }}>
					<LectureDescription {...laale} />
				</div>
			) : (
				<LectureDescription {...laale} />
			)}
		</>
	);
}
