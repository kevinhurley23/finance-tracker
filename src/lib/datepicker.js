import Pikaday from "pikaday";
import { dateObjToISO, dateISOToDisplay, dateISOToObj } from "./functions.js";

export function initializePikaday(inputElement, dateRange, onSelect, container) {
  const picker = new Pikaday({
    field: inputElement,
    container: container,
    toString(date) {
      const ISO = dateObjToISO(date)
      return dateISOToDisplay(ISO);
    },
    minDate: dateISOToObj(dateRange[0]),
    maxDate: dateISOToObj(dateRange[1]),
    onSelect,
    onDraw(picker) {
      const inputWidth = inputElement.clientWidth;
      const pickerWidth = 258;
      picker.el.style.transform = `translateX(-${(pickerWidth - inputWidth) / 2}px)`
    }
  });
  return picker;
}
