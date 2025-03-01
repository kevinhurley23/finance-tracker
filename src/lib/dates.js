export const todayObj = new Date();
todayObj.setUTCHours(24, 0, 0, 0);

let year = todayObj.getFullYear();
let month = String(todayObj.getMonth() + 1).padStart(2, "0");
let day = String(todayObj.getDate()).padStart(2, "0");

export const todayStr = `${year}-${month}-${day}`;
