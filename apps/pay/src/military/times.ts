import { encode, Rational, scaleMoney, usd } from '@maestro-calc/core';
import { hoursBetween } from '@maestro-calc/pay-core/hours';
import {
  militaryTimeOf,
  numberWords,
  US_ZONES,
  zoneTimesOf,
  type MilitaryTime,
  type UsZone,
} from '@maestro-calc/pay-core/military-time';
import { decimalHoursText, hoursMinutesText, moneyText } from '../format.ts';
import { HOURS_PATHS } from '../hours/texts.ts';
import { fieldOf } from '../long-tail/clock.ts';
import { WORKED } from '../long-tail/live-links.ts';
import { nearestOf } from '../long-tail/nearest.ts';
import { pathOf, SHIFTS, UNTILS } from '../long-tail/routes.ts';
import type { LongTailSection, LongTailSource } from '../long-tail/sections.ts';
import { shiftLinksOf } from '../long-tail/shifts.ts';
import { untilLinksOf } from '../long-tail/until.ts';
import { titleOf } from '../seo/meta.ts';
import { converterOf } from './converter.ts';
import {
  MILITARY_CHART_PATHS,
  MILITARY_CONVERTER_PATHS,
  MILITARY_TIMES,
  militaryPathOf,
  type MilitaryTimeJob,
} from './routes.ts';

/*
 * The page of one time of day on the military clock, "1500 military time" (English only): the
 * 12-hour time worked out for its own hour, how it is said and when in the day it falls, its other
 * formats, the hours to and from midnight and noon, the same moment in every US time zone and in
 * Zulu time, and a shift that starts or ends then, counted and paid by the hours engine. Every
 * figure is the engine's; `MilitaryTimePage.astro` renders it.
 */

const DAY = 1440;
const NOON = 720;
/** The pay example: an 8-hour shift with a 30-minute unpaid break, at $20 an hour. */
const BREAK = 30;
const SHIFT = 8 * 60 + BREAK;
const LONG_SHIFT = 12 * 60;
const RATE = usd(20);

const at = (minutes: number): MilitaryTime => militaryTimeOf(((minutes % DAY) + DAY) % DAY);

/** When in the day a time falls, as a 12-hour speaker says it. */
const partOf = ({ hour, minute }: MilitaryTime): string => {
  if (hour === 0) return 'at night';
  if (hour < 5) return 'in the early morning';
  if (hour < 12) return 'in the morning';
  if (hour === 12) return minute === 0 ? 'at noon' : 'in the afternoon';
  if (hour < 18) return 'in the afternoon';
  if (hour < 21) return 'in the evening';
  return 'at night';
};

/** The time in plain words: `three o'clock in the afternoon`, `half past nine at night`, `noon`. */
const plainOf = (time: MilitaryTime): string => {
  if (time.minutes === 0) return 'midnight';
  if (time.minutes === NOON) return 'noon';
  const hour = numberWords(time.twelve.hour);
  return time.minute === 0
    ? `${hour} o'clock ${partOf(time)}`
    : `half past ${hour} ${partOf(time)}`;
};

/** Minutes as `15 h 0 min` and `15.00`. */
const lengthOf = (minutes: number): [string, string] => {
  const hours = Rational.of(minutes, 60);
  return [hoursMinutesText(hours), decimalHoursText(hours)];
};

/** `1400 · 2:00 PM`, with the day when it is not the Eastern one. */
const zoneCell = (minutes: number, day: number): string => {
  const time = militaryTimeOf(minutes);
  const when = day < 0 ? ', day before' : day > 0 ? ', next day' : '';
  return `${time.military} · ${time.twelveText}${when}`;
};

const ZONE_NAMES: Readonly<Record<UsZone['id'], string>> = {
  ET: 'Eastern Time (ET)',
  CT: 'Central Time (CT)',
  MT: 'Mountain Time (MT)',
  PT: 'Pacific Time (PT)',
  AKT: 'Alaska Time (AKT)',
  HT: 'Hawaii Time (HT)',
};

const SOURCES: readonly LongTailSource[] = [
  {
    label: '49 CFR part 71, Standard time zone boundaries (eCFR)',
    href: 'https://www.ecfr.gov/current/title-49/subtitle-A/part-71',
  },
  {
    label: '15 U.S.C. 260a, Advancement of time or changeover dates (daylight saving time)',
    href: 'https://www.law.cornell.edu/uscode/text/15/260a',
  },
];

/** The steps from military time to the 12-hour clock and back, for the hour `time` is in. */
const stepsOf = (time: MilitaryTime): string[] => {
  const { military, hour, minute, twelveText } = time;
  const hh = military.slice(0, 2);
  const mm = military.slice(2);
  const split = `Split ${military} into the hour, ${hh}, and the minutes, ${mm}.`;
  const keep = `Keep the minutes, ${mm}, as they are`;
  if (hour === 0)
    return [
      split,
      `Hour 00 is the first hour after midnight, which the 12-hour clock calls 12: hour 00 becomes 12.`,
      `${keep} and add AM, as for every hour before noon: ${twelveText}.`,
      `Back the other way: ${twelveText} is in the hour after midnight, so its 12 becomes 00, and the time is ${military}.`,
    ];
  if (hour < 12)
    return [
      split,
      hour < 10
        ? `Hours 01 to 11 are the same on both clocks: drop the leading 0 of ${hh} to get ${String(hour)}.`
        : `Hours 01 to 11 are the same on both clocks: hour ${hh} stays ${String(hour)}.`,
      `${keep} and add AM: ${twelveText}.`,
      hour < 10
        ? `Back the other way: ${twelveText} is a morning hour below 10, so it takes a leading 0: ${military}.`
        : `Back the other way: ${twelveText} is a morning hour, so it keeps its digits: ${military}.`,
    ];
  if (hour === 12)
    return [
      split,
      `Hour 12 is the hour of noon, and 12 stays 12 on both clocks: nothing is added or taken away.`,
      `${keep} and add PM, as for every time from noon on: ${twelveText}.`,
      `Back the other way: ${twelveText} keeps its 12, with no 12 to add, so the time is ${military}.`,
    ];
  const back = hour - 12;
  return [
    split,
    `${String(hour)} is past 12, so subtract 12: ${String(hour)} − 12 = ${String(back)}.`,
    `${keep} and add PM: ${twelveText}.`,
    `Back the other way: ${twelveText} is ${minute === 0 ? 'an hour' : 'a time'} after noon, so add 12 to its hour: ${String(back)} + 12 = ${String(hour)}, written ${military}.`,
  ];
};

/** The lead: the answer, then why, then how it is said. */
const leadOf = (time: MilitaryTime): string => {
  const { military, hour, twelveText, spoken } = time;
  const plain = plainOf(time);
  const said = `Said the military way, it is "${spoken}".`;
  if (hour === 0)
    return time.minute === 0
      ? `${military} is ${twelveText}, midnight at the start of a day. Hour 00 is the hour the 12-hour clock calls 12 AM. ${said} The same instant at the end of the day before is written 2400.`
      : `${military} is ${twelveText}, half an hour after midnight. Hour 00 is the hour the 12-hour clock calls 12 AM, and the minutes, ${String(time.minute)}, stay. ${said}`;
  if (hour < 12)
    return `${military} is ${twelveText}. Morning hours are the same on both clocks${hour < 10 ? ', the leading zero dropped' : ''}: ${twelveText} is ${plain}. ${said}`;
  if (hour === 12)
    return `${military} is ${twelveText}. Hour 12 is the hour of noon on both clocks and takes PM: ${twelveText} is ${plain}. ${said}`;
  return `${military} is ${twelveText}. The hour, ${String(hour)}, is past 12, so ${String(hour)} − 12 = ${String(hour - 12)} and the minutes stay: ${twelveText} is ${plain}. ${said}`;
};

/** How the time is said aloud, the other ways it is heard, and when in the day it falls. */
const saidOf = (time: MilitaryTime): string[] => {
  const { military, hour, minute, spoken, twelveText } = time;
  const pair = spoken.replace(/ hundred hours$/, '');
  const ways =
    minute === 0
      ? hour === 0
        ? `${military} is "${spoken}", and many simply say "midnight". At the end of a day the same moment is "twenty-four hundred hours", 2400.`
        : hour < 10
          ? `${military} is "${spoken}". The leading zero is said, as "zero" or as "oh": "oh ${pair.replace(/^zero /, '')} hundred", and in speech "hours" is often dropped, "${pair} hundred".`
          : `${military} is "${spoken}", or just "${pair} hundred" in speech. It is never "one thousand ${hour === 10 ? '' : `${numberWords(hour - 10)} `}hundred": the first two digits are the hour, said as one number.`
      : hour < 10
        ? `${military} is "${spoken}", the two leading zeros said as "zero" or as "oh": "${spoken.replace(/zero/g, 'oh')}". Some add "hours": "${spoken} hours".`
        : `${military} is "${spoken}": the hour, ${String(hour)}, then the minutes, ${String(minute)}, each said as one number. Some add "hours": "${spoken} hours".`;
  return [ways, `On a 12-hour clock the same moment is ${twelveText}, ${plainOf(time)}.`];
};

/** The other ways of writing the time, from the engine. */
const formatsOf = (time: MilitaryTime): string[][] => {
  const { military, colon, minutes, spoken, twelveText } = time;
  return [
    ['12-hour clock', twelveText],
    ['24-hour clock', colon],
    ['Military, written', military],
    ['Military, said', spoken],
    ['ISO 8601, extended', `${colon}:00`],
    ['ISO 8601, basic', `${military}00`],
    ['Minutes after midnight', String(minutes)],
    ['Seconds after midnight', (minutes * 60).toLocaleString('en-US')],
    ['Decimal hours after midnight', lengthOf(minutes)[1]],
    ['Share of the day gone', `${((minutes * 100) / DAY).toFixed(2)}%`],
  ];
};

/** The hours since and until midnight and noon. */
const clockSectionOf = (time: MilitaryTime): LongTailSection => {
  const { military, minutes } = time;
  const [sinceH] = lengthOf(minutes);
  const [untilH] = lengthOf(DAY - minutes);
  const noonRow =
    minutes < NOON
      ? [['Until noon, 1200', ...lengthOf(NOON - minutes)]]
      : minutes > NOON
        ? [['Since noon, 1200', ...lengthOf(minutes - NOON)]]
        : [];
  const noon =
    minutes < NOON
      ? `Noon, 1200, is ${lengthOf(NOON - minutes)[0]} later, so ${military} is in the AM half of the day.`
      : minutes > NOON
        ? `Noon, 1200, was ${lengthOf(minutes - NOON)[0]} earlier, so ${military} is in the PM half of the day.`
        : `${military} is noon itself, the point where the AM half of the day ends and the PM half begins.`;
  return {
    id: 'midnight-noon',
    heading: `Hours from ${military} to midnight and noon`,
    paragraphs: [
      `On the military clock the hours to midnight are 2400 minus the time, done in hours and minutes: ${military} is ${sinceH} after the midnight that began the day, 0000, and ${untilH} before the next one, 2400. ${noon}`,
    ],
    table: {
      caption: `From ${military} to midnight and noon`,
      head: ['Count', 'Hours and minutes', 'Decimal hours'],
      rows: [
        ['Since midnight, 0000', ...lengthOf(minutes)],
        ['Until midnight, 2400', ...lengthOf(DAY - minutes)],
        ...noonRow,
      ],
    },
  };
};

/** The same moment in every US zone, winter and summer, from Eastern Time, and in Zulu time. */
const zonesSectionOf = (time: MilitaryTime): LongTailSection => {
  const { military, minutes } = time;
  const winter = zoneTimesOf(minutes, 'standard');
  const summer = zoneTimesOf(minutes, 'daylight');
  const cell = (times: typeof winter, id: UsZone['id']): string => {
    const found = times.find(({ zone }) => zone === id);
    if (found === undefined) throw new Error(`no zone ${id}`);
    return zoneCell(found.minutes, found.day);
  };
  const short = (text: string): string => text.replace(/ · .*$/, '');
  // Zulu (UTC) is 5 hours ahead of Eastern Standard Time and 4 ahead of Eastern Daylight Time
  const zulu = (hours: number): string => {
    const moved = minutes + hours * 60;
    return `${at(moved).military}Z${moved >= DAY ? ' (the next day)' : ''}`;
  };
  return {
    id: 'zones',
    heading: `${military} in the US time zones`,
    paragraphs: [
      `The military clock is the same in every zone; what changes is the moment it names. The table reads ${military} as Eastern Time (ET), the reference zone, and gives that same moment in the six zones of the 50 states, in standard time and in daylight time.`,
    ],
    table: {
      caption: `${military} Eastern Time across the US`,
      head: ['Time zone', 'Standard time, November to March', 'Daylight time, March to November'],
      rows: US_ZONES.map(({ id }) => [ZONE_NAMES[id], cell(winter, id), cell(summer, id)]),
    },
    after: [
      `Hawaii keeps standard time all year, so at ${military} Eastern it is ${short(cell(winter, 'HT'))} in Honolulu in winter and ${short(cell(summer, 'HT'))} in summer. Arizona, outside the Navajo Nation, keeps Mountain Standard Time all year: ${short(cell(winter, 'MT'))} there in winter and ${short(cell(summer, 'PT'))} in summer.`,
      `Military orders and flight plans often give the time in UTC with the letter Z, "Zulu": ${military} Eastern is ${zulu(5)} in winter and ${zulu(4)} in summer.`,
    ],
  };
};

/** The hours engine on a shift from `start` to `end` less `unpaidBreak`: hours and overnight. */
const runShift = (start: number, end: number, unpaidBreak: number) => {
  const raw = { start: fieldOf(start), end: fieldOf(end), unpaidBreak: String(unpaidBreak) };
  const ran = hoursBetween.run(raw);
  const validated = hoursBetween.validate(raw);
  if (!ran.ok || !validated.ok) throw new Error(`the shift from ${fieldOf(start)} must run`);
  const hours = ran.value.outputs.find(({ key }) => key === 'hours')?.value;
  if (hours === undefined) throw new Error('the hours engine gives no hours');
  return {
    hours,
    overnight: ran.value.warnings.some(({ code }) => code === 'overnight'),
    href: `${HOURS_PATHS.en}?${encode(hoursBetween, validated.value)}`,
  };
};

/** A shift that starts or ends at the time, counted and paid by the hours engine. */
const shiftsSectionOf = (time: MilitaryTime): LongTailSection => {
  const { military, minutes } = time;
  const end = at(minutes + SHIFT);
  const start = at(minutes - SHIFT);
  const starting = runShift(minutes, end.minutes, BREAK);
  const long = at(minutes + LONG_SHIFT);
  const twelve = runShift(minutes, long.minutes, 0);
  const pay = moneyText(scaleMoney(RATE, starting.hours));
  const shiftLinks = shiftLinksOf('en').links;
  const matching = SHIFTS.filter((each) => each.start === minutes || each.end % DAY === minutes)
    .map((each) => shiftLinks.find(({ href }) => href === pathOf(each, 'en')))
    .filter((link) => link !== undefined);
  const until = UNTILS.find((each) => each.minutes === minutes);
  const untilLink =
    until === undefined
      ? []
      : untilLinksOf('en').links.filter(({ href }) => href === pathOf(until, 'en'));
  return {
    id: 'shifts',
    heading: `A shift that starts or ends at ${military}`,
    paragraphs: [
      `An 8-hour shift with a 30-minute unpaid break that starts at ${military} ends at ${end.military} (${end.twelveText})${starting.overnight ? ' the next day' : ''}: the hours calculator counts ${hoursMinutesText(starting.hours)} worked, which at $20.00 an hour is ${pay} before taxes.`,
      `A shift of the same length that ends at ${military} started at ${start.military} (${start.twelveText})${minutes < SHIFT ? ' the day before' : ''}. A 12-hour shift from ${military} with no break runs to ${long.military} (${long.twelveText})${twelve.overnight ? ' the next day' : ''}, ${hoursMinutesText(twelve.hours)} that pay ${moneyText(scaleMoney(RATE, twelve.hours))} at the same rate; federal overtime counts the hours of the week, not of one shift.`,
    ],
    links: [
      ...matching,
      ...untilLink,
      {
        href: starting.href,
        label: `Count the ${military} to ${end.military} shift in the hours calculator`,
      },
    ],
  };
};

export interface MilitaryTimePage {
  readonly title: string;
  readonly description: string;
  readonly kicker: string;
  readonly h1: string;
  readonly lead: string;
  readonly figure: string;
  readonly figureLabel: string;
  readonly breakdown: string;
  readonly rows: readonly { readonly label: string; readonly value: string }[];
  /** The converter the page answers for: its button and the middle step of the breadcrumb. */
  readonly calculator: { readonly href: string; readonly label: string; readonly title: string };
  readonly note: string;
  readonly paths: { readonly en: string };
  readonly sections: readonly LongTailSection[];
  readonly sources: readonly LongTailSource[];
  readonly others: {
    readonly heading: string;
    readonly links: readonly { readonly href: string; readonly label: string }[];
  };
}

/** The page of one time of day, every figure from the engines at build time. */
export const militaryTimePageOf = (job: MilitaryTimeJob): MilitaryTimePage => {
  const time = militaryTimeOf(job.minutes);
  const { military, twelveText, spoken, colon } = time;
  const h1 = `${military} in military time is ${twelveText}`;
  return {
    title: titleOf(h1),
    description: `${military} in military time is ${twelveText} (${plainOf(time)}), said ${spoken}. With each US zone, hours to midnight and a shift's pay.`,
    kicker: 'Military time',
    h1,
    lead: leadOf(time),
    figure: twelveText,
    figureLabel: `${military} on a 12-hour clock`,
    breakdown: `${military} in other forms`,
    rows: [
      { label: '24-hour clock', value: colon },
      { label: 'Said', value: spoken },
      { label: 'Minutes after midnight', value: String(time.minutes) },
    ],
    calculator: {
      href: MILITARY_CONVERTER_PATHS.en,
      label: 'Convert another time',
      title: converterOf('en').title,
    },
    note: `Typed into the converter, ${military}, ${colon} and ${twelveText} give the same result.`,
    paths: { en: militaryPathOf(job) },
    sections: [
      { id: 'worked', heading: WORKED.en, paragraphs: [], steps: stepsOf(time) },
      { id: 'said', heading: `How ${military} is said`, paragraphs: saidOf(time) },
      {
        id: 'formats',
        heading: `${military} in other formats`,
        paragraphs: [
          `The same moment, ${twelveText}, in the forms schedules, software and time cards use.`,
        ],
        table: {
          caption: `${military} written ten ways`,
          head: ['Format', military],
          rows: formatsOf(time),
        },
      },
      clockSectionOf(time),
      zonesSectionOf(time),
      shiftsSectionOf(time),
    ],
    sources: SOURCES,
    others: {
      heading: 'Nearby military times',
      links: [
        ...nearestOf(MILITARY_TIMES, job).map((other) => {
          const each = militaryTimeOf(other.minutes);
          return {
            href: militaryPathOf(other),
            label: `${each.military} in military time is ${each.twelveText}`,
          };
        }),
        { href: MILITARY_CHART_PATHS.en, label: 'Military time chart: every hour of the day' },
      ],
    },
  };
};
