import { IndividualLectureAuditoryOrLaboratoryExcerise } from "../../../context/BoljsiUrnikContext";
import "./Lecture.css";
export default function Lecture(laale: IndividualLectureAuditoryOrLaboratoryExcerise) {
	return (
		<div
			className="grid-entry"
			style={{ gridRow: laale.gridPosition, backgroundColor: laale.lectureBackgroundColor }}
		>
			<div className="description">
				<div className="top-aligned">
					<div className="row">
						<a className="link-subject" href={laale.lectureNameHref}>
							{laale.lectureName}
						</a>
						<span className="entry-type">| P</span>
					</div>
					<div className="row">
						<a className="link-classroom" href="">
							{laale.classroom}
						</a>
					</div>

					<div className="row">
						<a className="link-teacher" href="">
							{laale.professor}
						</a>
					</div>
				</div>
				<div className="bottom-aligned">
					{laale.groups.map((group) => {
						return (
							<span className="row" key={group}>
								<a className="link-group" href="">
									{group}
								</a>
							</span>
						);
					})}
				</div>
			</div>
		</div>
	);
}
