import { IndividualLectureAuditoryOrLaboratoryExcerise } from "../../../context/BoljsiUrnikContext";
import "./Lecture.css";
export default function Lecture(laale: IndividualLectureAuditoryOrLaboratoryExcerise) {
	return (
		<div
			className="grid-entry"
			style={{ gridRow: laale.gridPosition, backgroundColor: "rgba(111, 179, 227, 0.7)" }}
		>
			<div className="description">
				<div className="top-aligned">
					<div className="row">
						<a className="link-subject" href={laale.classNameHref}>
							{laale.lectureName}
						</a>
						<span className="entry-type">| P</span>
					</div>
					<div className="row">
						<a className="link-classroom" href="?classroom=142">
							{laale.classroom}
						</a>
					</div>

					<div className="row">
						<a className="link-teacher" href="?teacher=73">
							{laale.professor}
						</a>
					</div>
				</div>
				<div className="bottom-aligned">
					{laale.groups.map((group) => {
						return (
							<div className="row" key={group}>
								<a className="link-group" href="?group=58962">
									{group}
								</a>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	);
}
