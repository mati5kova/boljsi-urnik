import getNewDate from "./getNewDate";

//funkcija vrne array z dvema elementoma, začetek in konec šolskega leta (leto)
export default function getCurrentSchoolYear(): [number, number] {
	const today = getNewDate();
	const month = today.getMonth() + 1; // 0-index based -> JAN:0

	const schoolYear: [number, number] = [-1, -1];

	// če do funkcije dostopamo med oktobrom in decembrom je prvi element trenutno leto, drugi element pa naslednje leto
	//
	// če do funkcije dostopamo ostale mesece v letu je prvi element prejšnje leto, drugi pa trenutno leto
	if ([10, 11, 12].includes(month)) {
		schoolYear[0] = today.getFullYear();
		schoolYear[1] = today.getFullYear() + 1;
	} else if ([1, 2, 3, 4, 5, 6, 7, 8, 9].includes(month)) {
		schoolYear[0] = today.getFullYear() - 1;
		schoolYear[1] = today.getFullYear();
	}

	return schoolYear;
}
