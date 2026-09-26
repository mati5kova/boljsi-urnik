import getNewDate from "./getNewDate";

//funkcija vrne array z dvema elementoma, začetek in konec šolskega leta (leto)
export default function getCurrentSchoolYear(date: Date = getNewDate()): [number, number] {
    const today = date;
    const month = today.getMonth() + 1; // 0-index based -> JAN:0

    const schoolYear: [number, number] = [-1, -1];

    // September šteje v novo šolsko leto, ker se takrat lahko začnejo objavljati novi personalizirani urniki.
    // Če do funkcije dostopamo med septembrom in decembrom je prvi element trenutno leto, drugi pa naslednje leto.
    //
    // če do funkcije dostopamo ostale mesece v letu je prvi element prejšnje leto, drugi pa trenutno leto
    if ([9, 10, 11, 12].includes(month)) {
        schoolYear[0] = today.getFullYear();
        schoolYear[1] = today.getFullYear() + 1;
    } else if ([1, 2, 3, 4, 5, 6, 7, 8].includes(month)) {
        schoolYear[0] = today.getFullYear() - 1;
        schoolYear[1] = today.getFullYear();
    }

    return schoolYear;
}
