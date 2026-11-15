import { clock24Text } from '../format.ts';
import { descriptionOf, titleOf } from '../seo/meta.ts';
import type { TimeOffset } from './routes.ts';
import type { LongTailSection } from './sections.ts';
import { clockShift } from './time-math.ts';

/*
 * The Spanish "hace N horas" pages (Search Console, 7-13 Nov 2026: position 9 in Mexico, Spain and
 * South America, almost no clicks). The answer depends on the visitor's clock, so the title works
 * one fixed time out, 15:00, which no build time changes; the description gives the rule and what
 * the click finds; the questions work two more times out. Times are on the 24-hour clock, which
 * reads the same in Spain and in Latin America.
 */

/** The time the title works from: 15:00, mid-afternoon. */
const TITLE_NOW = 900;
/** The two times the questions work from: 8:00 and 22:00. */
const ASKED_NOW = [480, 1320] as const;

const n = (value: number): string => value.toLocaleString('en-US');

/** `1 hora`, `5 horas`. */
const hoursOf = (h: number): string => `${String(h)} ${h === 1 ? 'hora' : 'horas'}`;

/** `1 día`, `2 días`. */
const daysOf = (d: number): string => `${String(d)} ${d === 1 ? 'día' : 'días'}`;

/** `las 10:00`, `la 1:00`: a time of day on the 24-hour clock after its article. */
const lasOf = (minutes: number): string => {
  const time = clock24Text(minutes);
  return `${time.startsWith('1:') ? 'la' : 'las'} ${time}`;
};

/** `eran las 10:00`, `era la 1:00`. */
const eranOf = (minutes: number): string =>
  clock24Text(minutes).startsWith('1:') ? `era ${lasOf(minutes)}` : `eran ${lasOf(minutes)}`;

/** The day a time lands on, `days` from today: `del mismo día`, `de ayer`, `de hace 3 días`. */
const dayOf = (days: number): string => {
  if (days === 0) return 'del mismo día';
  if (days === -1) return 'de ayer';
  if (days === -2) return 'de anteayer';
  return `de hace ${String(-days)} días`;
};

/** `ayer`, `anteayer`, `3 días atrás`: the day `days` before today, by name. */
const dayNameOf = (days: number): string => {
  if (days === 1) return 'ayer';
  if (days === 2) return 'anteayer';
  return `${String(days)} días atrás`;
};

const capitalOf = (text: string): string => `${text.charAt(0).toUpperCase()}${text.slice(1)}`;

/** The title, the description and the questions of a Spanish hours ago page. */
export const agoSearchOf = (
  job: TimeOffset,
): { readonly title: string; readonly description: string; readonly faq: LongTailSection } => {
  if (job.unit !== 'hour' || job.direction !== 'ago') {
    throw new Error(`${job.slug.es} is not an hours ago page`);
  }
  const h = job.amount;
  const q = Math.floor(h / 24);
  const r = h % 24;
  const H = hoursOf(h);
  const back = (now: number) => clockShift(now, -h * 60);
  const shown = back(TITLE_NOW);
  const title =
    r === 0
      ? `Hace ${H}: la misma hora ${dayOf(-q)}`
      : `Hace ${H} ${eranOf(shown.minutes)}${shown.days === 0 ? '' : ` ${dayOf(shown.days)}`} si ahora son las 15:00`;
  const cut = r * 60;
  const description =
    r === 0
      ? `Qué hora era hace ${H}, calculada con tu reloj: la misma hora, ${daysOf(q)} atrás. Con tabla de cada día de la semana y de cada mes.`
      : q === 0
        ? `Qué hora era hace ${H}, calculada con tu reloj: tu hora menos ${String(h)} h. Antes de ${lasOf(cut)}, la fecha es la de ayer; con tabla de las 24 horas.`
        : `Qué hora era hace ${H}, calculada con tu reloj: tu hora menos ${String(r)} h, ${daysOf(q)} atrás. Antes de ${lasOf(cut)}, son ${daysOf(q + 1)} atrás; con tabla de las 24 horas.`;
  const asked = ASKED_NOW.map((now) => {
    const then = back(now);
    const crossed = then.days !== 0 && r !== 0 ? ': la cuenta cruza la medianoche' : '';
    return {
      question: `¿Qué hora era hace ${H} si son ${lasOf(now)}?`,
      answer: `${capitalOf(eranOf(then.minutes))} ${dayOf(then.days)}${crossed}.`,
    };
  });
  const yesterday =
    r === 0
      ? q === 1
        ? `Sí: hace ${H} es ayer, a la misma hora del reloj.`
        : `No: hace ${H} es ${dayNameOf(q)}, a la misma hora del reloj.`
      : q === 0
        ? `Solo si ahora es antes de ${lasOf(cut)}: entonces la cuenta cruza la medianoche y cae en el día anterior. Desde ${lasOf(cut)}, es hoy.`
        : `Desde ${lasOf(cut)}, hace ${H} es ${dayNameOf(q)}; antes de ${lasOf(cut)}, es ${dayNameOf(q + 1)}.`;
  return {
    title: titleOf(title),
    description: descriptionOf(description),
    faq: {
      id: 'faq',
      heading: 'Preguntas frecuentes',
      paragraphs: [],
      questions: [
        ...asked,
        { question: `¿Hace ${H} fue ayer?`, answer: yesterday },
        {
          question: `¿Cuántos minutos ${h === 1 ? 'es' : 'son'} ${H}?`,
          answer: `${n(h * 60)} minutos (${String(h)} × 60), o ${n(h * 3600)} segundos.`,
        },
      ],
    },
  };
};
