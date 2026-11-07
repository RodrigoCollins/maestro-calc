/** A date of the Gregorian calendar. */
export interface Civil {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** Days from 1970-01-01 to the date (Howard Hinnant's civil-days algorithm); negative before it. */
export const daysFromCivil = (year: number, month: number, day: number): number => {
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yearOfEra = y - era * 400;
  const dayOfYear = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const dayOfEra =
    yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146_097 + dayOfEra - 719_468;
};

/** The date `days` after 1970-01-01. */
export const civilFromDays = (days: number): Civil => {
  const shifted = days + 719_468;
  const era = Math.floor(shifted / 146_097);
  const dayOfEra = shifted - era * 146_097;
  const yearOfEra = Math.floor(
    (dayOfEra -
      Math.floor(dayOfEra / 1460) +
      Math.floor(dayOfEra / 36_524) -
      Math.floor(dayOfEra / 146_096)) /
      365,
  );
  const dayOfYear =
    dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
  const shiftedMonth = Math.floor((5 * dayOfYear + 2) / 153);
  const month = shiftedMonth < 10 ? shiftedMonth + 3 : shiftedMonth - 9;
  const day = dayOfYear - Math.floor((153 * shiftedMonth + 2) / 5) + 1;
  return { year: yearOfEra + era * 400 + (month <= 2 ? 1 : 0), month, day };
};

/** The days of a month (1 to 12) of a year: the distance to the first day of the next month. */
export const daysInMonth = (year: number, month: number): number =>
  daysFromCivil(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, 1) -
  daysFromCivil(year, month, 1);
