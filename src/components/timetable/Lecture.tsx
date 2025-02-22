export default function Lecture() {
	return (
		//gridRow, backgroundColor v prop
		<div className="grid-entry" style={{ gridRow: "5 / span 3", backgroundColor: "rgba(111, 179, 227, 0.7)" }}>
			<div className="description">
				<div className="top-aligned">
					<div className="row">
						<a className="link-subject" href="?subject=63209">
							RK_P
						</a>
						<span className="entry-type">| P</span>
						<div className="entry-hover">besedilo</div>
					</div>
					<div className="row">
						<a className="link-classroom" href="?classroom=142">
							P01
						</a>
					</div>

					<div className="row">
						<a className="link-teacher" href="?teacher=73">
							Zoran Bosnić
						</a>
					</div>
				</div>
				<div className="bottom-aligned">
					<div className="row">
						<a className="link-group" href="?group=58962">
							1_BUN-RI
						</a>
					</div>

					<div className="row">
						<a className="link-group" href="?group=59121">
							2_BUN-RM
						</a>
					</div>

					<div className="row">
						<a className="link-group" href="?group=58964">
							2_BUN-UI
						</a>
					</div>

					<div className="row">
						<a className="link-group" href="?group=59155">
							63209_PAD
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
