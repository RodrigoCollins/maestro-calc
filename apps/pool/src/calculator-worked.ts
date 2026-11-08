import { ft3, gal, isQuantityOf, PI, Rational, valueIn } from '@maestro-calc/core';
import { poolAlkalinity } from '@maestro-calc/pool-core/pool-alkalinity';
import { poolCalcium } from '@maestro-calc/pool-core/pool-calcium';
import { poolChlorine } from '@maestro-calc/pool-core/pool-chlorine';
import { poolFillTime } from '@maestro-calc/pool-core/pool-fill-time';
import { poolHeater } from '@maestro-calc/pool-core/pool-heater';
import { poolPh } from '@maestro-calc/pool-core/pool-ph';
import { poolPump } from '@maestro-calc/pool-core/pool-pump';
import { poolSalt } from '@maestro-calc/pool-core/pool-salt';
import { poolStabilizer } from '@maestro-calc/pool-core/pool-stabilizer';
import { poolVolume } from '@maestro-calc/pool-core/pool-volume';
import { volumeText } from './format.ts';
import { hrefOf, langOf, routeOf, type Lang } from './routes.ts';
import {
  BICARBONATE_PER_PPM,
  GRAMS_PER_OUNCE,
  GRAMS_PER_POUND,
  is,
  LITERS_PER_GALLON,
  ML_PER_FLUID_OUNCE,
  n,
  out,
  POUNDS_PER_GALLON,
  r,
  run,
  shown,
  type Engine,
} from './worked-math.ts';

/*
 * The worked example of each calculator page (AdSense audit 2026-11-08): the figures the page
 * shows before anyone types, worked out step by step in the page's language, and what to work out
 * next for the same pool, with that dose and a link. Every figure is the engine's own run at its
 * defaults, or a sourced constant times them; `≈` marks a rounded step. The job pages work out
 * their own sizes in other words (`job-detail.ts`), so no step reads the same on both.
 */

type Raw = Readonly<Record<string, string>>;

/** The bicarbonate per ppm as the step writes it, 84.007 ÷ 50.04 to four places. */
const PER_PPM_SHOWN = r('1.6788');

export interface CalculatorWorked {
  readonly heading: string;
  readonly steps: readonly string[];
  readonly next: {
    readonly heading: string;
    readonly items: readonly {
      readonly text: string;
      readonly link: { readonly href: string; readonly label: string };
    }[];
  };
}

/** The inputs each calculator opens on, as the engines default them (`calculator-worked.test.ts`). */
export const DEFAULTS = {
  volume: {
    shape: 'rectangle',
    length: '32 ft',
    width: '16 ft',
    shallow: '3 ft 6 in',
    deep: '8 ft',
  },
  salt: { gallons: '20000', current: '2400', target: '3200' },
  chlorine: { gallons: '20000', current: '1', target: '3', product: 'liquid-12-5' },
  pump: { gallons: '20000' },
  ph: { gallons: '20000', product: 'muriatic-31-45', drops: '2' },
  alkalinity: { gallons: '20000', current: '70', target: '100' },
  stabilizer: { gallons: '20000', current: '0', target: '30' },
  calcium: { gallons: '20000', current: '180', target: '200' },
  heater: { gallons: '20000', rise: '10', hours: '24' },
  'fill-time': { gallons: '20000', flow: '10' },
} as const satisfies Record<string, Raw>;

export type CalculatorId = keyof typeof DEFAULTS;

export const ENGINES: Readonly<Record<CalculatorId, Engine>> = {
  volume: poolVolume,
  salt: poolSalt,
  chlorine: poolChlorine,
  pump: poolPump,
  ph: poolPh,
  alkalinity: poolAlkalinity,
  stabilizer: poolStabilizer,
  calcium: poolCalcium,
  heater: poolHeater,
  'fill-time': poolFillTime,
};

const q = (value: string): Rational => {
  const parsed = Rational.fromString(value);
  if (!parsed.ok) throw new Error(`not a number: ${value}`);
  return parsed.value;
};

const G = (raw: { readonly gallons: string }): Rational => q(raw.gallons);

const link = (id: string, lang: Lang, en: string, es: string) => ({
  href: hrefOf(id, lang),
  label: lang === 'en' ? en : es,
});

type Texts = (lang: Lang) => {
  readonly steps: readonly string[];
  readonly next: CalculatorWorked['next']['items'];
};

const t = (lang: Lang, en: string, es: string): string => (lang === 'en' ? en : es);

const salt: Texts = (lang) => {
  const raw = DEFAULTS.salt;
  const g = G(raw);
  const missing = q(raw.target).sub(q(raw.current));
  const water = g.mul(POUNDS_PER_GALLON);
  const pounds = water.mul(missing).div(Rational.of(1_000_000));
  const bags = String(run(poolSalt, raw).get('bags'));
  const kg = out(poolSalt, raw, 'kilograms');
  const first = pounds.mul(Rational.of(3, 4));
  const stabilizer = out(poolStabilizer, DEFAULTS.stabilizer, 'pounds');
  return {
    steps: [
      t(
        lang,
        `Water: ${n(g)} gal × 8.34 lb ${is(water)} lb.`,
        `Peso del agua: ${n(g)} gal × 8.34 lb ${is(water)} lb.`,
      ),
      t(
        lang,
        `Missing salt: ${n(q(raw.target))} − ${n(q(raw.current))} = ${n(missing)} ppm, ${n(missing)} lb in each million lb of water.`,
        `Sal que falta: ${n(q(raw.target))} − ${n(q(raw.current))} = ${n(missing)} ppm, ${n(missing)} lb por cada millón de lb de agua.`,
      ),
      t(
        lang,
        `Pounds: ${n(water)} × ${n(missing)} ÷ 1,000,000 ${is(pounds, 2)}, shown as ${n(pounds, 1)} lb, or ${kg} kg.`,
        `Libras: ${n(water)} × ${n(missing)} ÷ 1,000,000 ${is(pounds, 2)}, que se muestra como ${n(pounds, 1)} lb, o ${kg} kg.`,
      ),
      t(
        lang,
        `Bags of 40 lb: ${n(pounds, 2)} ÷ 40 ${is(pounds.div(Rational.of(40)), 2)}, rounded up to ${bags}.`,
        `Bolsas de 40 lb: ${n(pounds, 2)} ÷ 40 ${is(pounds.div(Rational.of(40)), 2)}, que se redondea a ${bags}.`,
      ),
      t(
        lang,
        `First addition, three quarters: ${n(pounds, 2)} × 3 ÷ 4 ${is(first, 1)} lb, then a salt test after 24 hours before the rest.`,
        `Primera adición, tres cuartas partes: ${n(pounds, 2)} × 3 ÷ 4 ${is(first, 1)} lb; mide la sal después de 24 horas antes de agregar el resto.`,
      ),
    ],
    next: [
      {
        text: t(
          lang,
          `A salt cell still needs stabilizer: from 0 to 30 ppm, ${n(g)} gal take ${stabilizer} lb of cyanuric acid.`,
          `Una celda de sal también necesita estabilizador: de 0 a 30 ppm, ${n(g)} gal llevan ${stabilizer} lb de ácido cianúrico.`,
        ),
        link: link(
          'stabilizer',
          lang,
          'Pool stabilizer calculator',
          'Calculadora de estabilizador',
        ),
      },
      {
        text: t(
          lang,
          `Still choosing? A cell runs at ${n(q(raw.target))} ppm on Hayward’s AquaRite manual; the guide weighs it against chlorine you add by hand.`,
          `¿Todavía decides? Una celda trabaja a ${n(q(raw.target))} ppm según el manual de AquaRite de Hayward; la guía la compara con el cloro que agregas a mano.`,
        ),
        link: link(
          'salt-guide',
          lang,
          'Salt water pool vs chlorine pool',
          'Piscina de agua salada o de cloro',
        ),
      },
    ],
  };
};

const chlorine: Texts = (lang) => {
  const raw = DEFAULTS.chlorine;
  const g = G(raw);
  const raise = q(raw.target).sub(q(raw.current));
  const liters = g.mul(LITERS_PER_GALLON);
  const grams = shown(liters, 1).mul(raise).div(Rational.of(1000));
  const ml = shown(grams, 3).mul(Rational.of(8));
  const shock = { gallons: raw.gallons, current: '0', target: '10', product: 'cal-hypo-65' };
  return {
    steps: [
      t(
        lang,
        `Liters: ${n(g)} gal × 3.785411784 ${is(liters, 1)} L.`,
        `Litros: ${n(g)} gal × 3.785411784 ${is(liters, 1)} L.`,
      ),
      t(
        lang,
        `Raise: ${raw.target} − ${raw.current} = ${n(raise)} ppm, ${n(raise)} mg of available chlorine in each liter, ${n(liters, 1)} × ${n(raise)} ÷ 1,000 ${is(grams, 3)} g in all.`,
        `Aumento: ${raw.target} − ${raw.current} = ${n(raise)} ppm, ${n(raise)} mg de cloro disponible en cada litro, ${n(liters, 1)} × ${n(raise)} ÷ 1,000 ${is(grams, 3)} g en total.`,
      ),
      t(
        lang,
        `At 12.5 g in 100 mL: ${n(grams, 3)} × 100 ÷ 12.5 ${is(ml, 1)} mL of the jug.`,
        `A 12.5 g por cada 100 mL: ${n(grams, 3)} × 100 ÷ 12.5 ${is(ml, 1)} mL del producto.`,
      ),
      t(
        lang,
        `Fluid ounces: ${n(ml, 1)} ÷ 29.5735295625 ${is(shown(ml, 1).div(ML_PER_FLUID_OUNCE), 1)} fl oz, the figure above.`,
        `Onzas líquidas: ${n(ml, 1)} ÷ 29.5735295625 ${is(shown(ml, 1).div(ML_PER_FLUID_OUNCE), 1)} fl oz, la cifra de arriba.`,
      ),
      t(
        lang,
        `Change the product and the same ${n(raise)} ppm becomes ${out(poolChlorine, { ...raw, product: 'liquid-10' }, 'liquid')} fl oz of 10% liquid, ${out(poolChlorine, { ...raw, product: 'cal-hypo-65' }, 'dry')} oz of 65% cal-hypo or ${out(poolChlorine, { ...raw, product: 'dichlor-56' }, 'dry')} oz of 56% dichlor.`,
        `Cambia el producto y los mismos ${n(raise)} ppm son ${out(poolChlorine, { ...raw, product: 'liquid-10' }, 'liquid')} fl oz de líquido al 10%, ${out(poolChlorine, { ...raw, product: 'cal-hypo-65' }, 'dry')} oz de cal-hypo al 65% o ${out(poolChlorine, { ...raw, product: 'dichlor-56' }, 'dry')} oz de dicloro al 56%.`,
      ),
    ],
    next: [
      {
        text: t(
          lang,
          `Green water needs a shock: from 0 to 10 ppm, ${n(g)} gal take ${out(poolChlorine, shock, 'dry')} oz of 65% cal-hypo.`,
          `El agua verde necesita un tratamiento de choque: de 0 a 10 ppm, ${n(g)} gal llevan ${out(poolChlorine, shock, 'dry')} oz de cal-hypo al 65%.`,
        ),
        link: link(
          'shock-guide',
          lang,
          'How to shock a pool',
          'Cómo hacer un tratamiento de choque',
        ),
      },
      {
        text: t(
          lang,
          `Swim again only under the reentry level of the label: 4 ppm for 12.5% liquid and 65% cal-hypo, 3 ppm for dichlor.`,
          `Vuelve a nadar solo por debajo del nivel de reingreso de la etiqueta: 4 ppm para el líquido al 12.5% y el cal-hypo al 65%, 3 ppm para el dicloro.`,
        ),
        link: link(
          'swim-guide',
          lang,
          'When to swim after chemicals',
          'Cuándo nadar después de los químicos',
        ),
      },
    ],
  };
};

const pump: Texts = (lang) => {
  const raw = DEFAULTS.pump;
  const g = G(raw);
  const flow = g.div(Rational.of(360));
  const floor = Rational.of(36);
  const kept = flow.compare(floor) === -1 ? floor : flow;
  // the flow itself, not its rounded text, so the day's gallons check by hand
  const turned = kept === floor ? '36' : `${n(g)} ÷ 360`;
  return {
    steps: [
      t(lang, `Six hours: 6 × 60 = 360 minutes.`, `Seis horas: 6 × 60 = 360 minutos.`),
      t(
        lang,
        `Flow: ${n(g)} gal ÷ 360 min ${is(flow, 1)} gpm, the figure above.`,
        `Caudal: ${n(g)} gal ÷ 360 min ${is(flow, 1)} gpm, la cifra de arriba.`,
      ),
      t(
        lang,
        `The standard’s floor is 36 gpm, and ${n(flow, 1)} is ${flow.compare(floor) === -1 ? 'under it, so the pump moves 36' : 'over it, so it stands'}: ${n(kept, 1)} gpm.`,
        `El mínimo de la norma es 36 gpm, y ${n(flow, 1)} está ${flow.compare(floor) === -1 ? 'por debajo, así que la bomba mueve 36' : 'por encima, así que se queda'}: ${n(kept, 1)} gpm.`,
      ),
      t(
        lang,
        `Gentler, over 8 hours: ${n(g)} ÷ 480 ${is(g.div(Rational.of(480)), 1)} gpm.`,
        `Más suave, en 8 horas: ${n(g)} ÷ 480 ${is(g.div(Rational.of(480)), 1)} gpm.`,
      ),
      t(
        lang,
        `Running 24 hours at ${n(kept, 1)} gpm, the pump would move ${turned} × 1,440 ${is(kept.mul(Rational.of(1440)))} gallons, ${n(kept.mul(Rational.of(1440)).div(g), 1)} times the pool.`,
        `Funcionando 24 horas a ${n(kept, 1)} gpm, la bomba movería ${turned} × 1,440 ${is(kept.mul(Rational.of(1440)))} galones, ${n(kept.mul(Rational.of(1440)).div(g), 1)} veces la piscina.`,
      ),
    ],
    next: [
      {
        text: t(
          lang,
          `Filling the same ${n(g)} gal with a 10 gallon a minute hose takes ${out(poolFillTime, DEFAULTS['fill-time'], 'time')}.`,
          `Llenar los mismos ${n(g)} gal con una manguera de 10 galones por minuto lleva ${out(poolFillTime, DEFAULTS['fill-time'], 'time')}.`,
        ),
        link: link(
          'fill-time',
          lang,
          'Pool fill time calculator',
          'Calculadora de tiempo de llenado',
        ),
      },
      {
        text: t(
          lang,
          `How many hours a day to run it: one turnover of ${n(g)} gal at ${n(kept, 1)} gpm is 6 hours.`,
          `Cuántas horas al día prenderla: una vuelta completa de ${n(g)} gal a ${n(kept, 1)} gpm son 6 horas.`,
        ),
        link: link(
          'pump-guide',
          lang,
          'How long to run a pool pump',
          'Cuántas horas prender la bomba',
        ),
      },
    ],
  };
};

const ph: Texts = (lang) => {
  const raw = DEFAULTS.ph;
  const g = G(raw);
  const drops = q(raw.drops);
  const ratio = g.div(Rational.of(10_000));
  const ounces = ratio.mul(drops).mul(Rational.of(916, 100));
  const perDay = g.mul(Rational.of(32)).div(Rational.of(20_000));
  const days = out(poolPh, raw, 'days');
  const soda = { ...raw, product: 'soda-ash' };
  const alkalinity = { gallons: raw.gallons, current: '90', target: '100' };
  return {
    steps: [
      t(
        lang,
        `Per 10,000 gal: ${n(g)} ÷ 10,000 ${is(ratio, 1)}, and ${n(ratio, 1)} × ${n(drops)} drops × 9.16 fl oz ${is(ounces, 2)} fl oz of 31.45% acid.`,
        `Por cada 10,000 gal: ${n(g)} ÷ 10,000 ${is(ratio, 1)}, y ${n(ratio, 1)} × ${n(drops)} gotas × 9.16 fl oz ${is(ounces, 2)} fl oz de ácido al 31.45%.`,
      ),
      t(
        lang,
        `The most a day on HASA’s label: ${n(g)} × 32 ÷ 20,000 ${is(perDay, 1)} fl oz.`,
        `Lo máximo por día en la etiqueta de HASA: ${n(g)} × 32 ÷ 20,000 ${is(perDay, 1)} fl oz.`,
      ),
      t(
        lang,
        `Days: ${n(ounces, 2)} ÷ ${n(perDay, 1)} ${is(ounces.div(perDay), 3)}, rounded up to ${days}, with a test before each part.`,
        `Días: ${n(ounces, 2)} ÷ ${n(perDay, 1)} ${is(ounces.div(perDay), 3)}, que se redondea a ${days}, con una medición antes de cada parte.`,
      ),
      t(
        lang,
        `With the base demand test instead, ${n(drops)} drops are ${n(ratio, 1)} × ${n(drops)} × 5.13 ${is(ratio.mul(drops).mul(Rational.of(513, 100)), 2)} oz of soda ash, at most ${out(poolPh, soda, 'dryPerAddition')} oz at a time.`,
        `Con la prueba de demanda de base, ${n(drops)} gotas son ${n(ratio, 1)} × ${n(drops)} × 5.13 ${is(ratio.mul(drops).mul(Rational.of(513, 100)), 2)} oz de carbonato de sodio, como máximo ${out(poolPh, soda, 'dryPerAddition')} oz por vez.`,
      ),
    ],
    next: [
      {
        text: t(
          lang,
          `Test total alkalinity after the pH: from 90 to 100 ppm, ${n(g)} gal take ${out(poolAlkalinity, alkalinity, 'pounds')} lb of baking soda.`,
          `Mide la alcalinidad total después del pH: de 90 a 100 ppm, ${n(g)} gal llevan ${out(poolAlkalinity, alkalinity, 'pounds')} lb de bicarbonato de sodio.`,
        ),
        link: link('alkalinity', lang, 'Pool alkalinity calculator', 'Calculadora de alcalinidad'),
      },
      {
        text: t(
          lang,
          `Pour the ${n(perDay, 1)} fl oz of each day slowly into the deep end with the pump running, and run it at least 1 hour after.`,
          `Vierte las ${n(perDay, 1)} fl oz de cada día despacio en la parte honda con la bomba prendida, y déjala funcionar al menos 1 hora después.`,
        ),
        link: link('ph-guide', lang, 'How to lower pool pH', 'Cómo bajar el pH de la piscina'),
      },
    ],
  };
};

const alkalinity: Texts = (lang) => {
  const raw = DEFAULTS.alkalinity;
  const g = G(raw);
  const raise = q(raw.target).sub(q(raw.current));
  const liters = g.mul(LITERS_PER_GALLON);
  const grams = shown(liters, 1).mul(raise).mul(PER_PPM_SHOWN).div(Rational.of(1000));
  const places = 1;
  const calcium = { gallons: raw.gallons, current: '200', target: '250' };
  return {
    steps: [
      t(
        lang,
        `Liters: ${n(g)} gal × 3.785411784 ${is(liters, 1)} L of pool water.`,
        `Litros: ${n(g)} gal × 3.785411784 ${is(liters, 1)} L de agua.`,
      ),
      t(
        lang,
        `Raise: ${raw.target} − ${raw.current} = ${n(raise)} ppm as calcium carbonate, at 84.007 ÷ 50.04 ${is(BICARBONATE_PER_PPM, 4)} mg of bicarbonate a ppm in each liter.`,
        `Aumento: ${raw.target} − ${raw.current} = ${n(raise)} ppm como carbonato de calcio, a 84.007 ÷ 50.04 ${is(BICARBONATE_PER_PPM, 4)} mg de bicarbonato por ppm en cada litro.`,
      ),
      t(
        lang,
        `Grams: ${n(liters, 1)} × ${n(raise)} × 1.6788 ÷ 1,000 ${is(grams, 1)} g.`,
        `Gramos: ${n(liters, 1)} × ${n(raise)} × 1.6788 ÷ 1,000 ${is(grams, 1)} g.`,
      ),
      t(
        lang,
        `Pounds: ${n(grams, places)} ÷ 453.59237 ${is(shown(grams, places).div(GRAMS_PER_POUND), 1)} lb, the figure above; ounces: ÷ 28.349523125 ${is(shown(grams, places).div(GRAMS_PER_OUNCE), 1)} oz.`,
        `Libras: ${n(grams, places)} ÷ 453.59237 ${is(shown(grams, places).div(GRAMS_PER_POUND), 1)} lb, la cifra de arriba; onzas: ÷ 28.349523125 ${is(shown(grams, places).div(GRAMS_PER_OUNCE), 1)} oz.`,
      ),
    ],
    next: [
      {
        text: t(
          lang,
          `Balance calcium hardness next: from 200 to 250 ppm, ${n(g)} gal take ${out(poolCalcium, calcium, 'pounds')} lb of calcium chloride.`,
          `Después equilibra la dureza de calcio: de 200 a 250 ppm, ${n(g)} gal llevan ${out(poolCalcium, calcium, 'pounds')} lb de cloruro de calcio.`,
        ),
        link: link(
          'calcium',
          lang,
          'Pool calcium hardness calculator',
          'Calculadora de dureza de calcio',
        ),
      },
      {
        text: t(
          lang,
          `A public pool keeps ${n(q(raw.target))} ppm inside the 60 to 180 ppm of the CDC’s code; the chart gives every other range.`,
          `Una piscina pública mantiene ${n(q(raw.target))} ppm dentro de los 60 a 180 ppm del código de los CDC; la tabla da todos los demás rangos.`,
        ),
        link: link(
          'chemistry-chart',
          lang,
          'Pool water chemistry chart',
          'Tabla de química del agua',
        ),
      },
    ],
  };
};

const stabilizer: Texts = (lang) => {
  const raw = DEFAULTS.stabilizer;
  const g = G(raw);
  const raise = q(raw.target).sub(q(raw.current));
  const liters = g.mul(LITERS_PER_GALLON);
  const grams = shown(liters, 1).mul(raise).div(Rational.of(1000));
  const places = 2;
  const chlorine = DEFAULTS.chlorine;
  return {
    steps: [
      t(
        lang,
        `Liters: ${n(g)} gal × 3.785411784 ${is(liters, 1)} L to stabilize.`,
        `Litros: ${n(g)} gal × 3.785411784 ${is(liters, 1)} L por estabilizar.`,
      ),
      t(
        lang,
        `Raise: ${raw.target} − ${raw.current} = ${n(raise)} ppm, ${n(raise)} mg of cyanuric acid in each liter: ${n(liters, 1)} × ${n(raise)} ÷ 1,000 ${is(grams, 2)} g.`,
        `Aumento: ${raw.target} − ${raw.current} = ${n(raise)} ppm, ${n(raise)} mg de ácido cianúrico en cada litro: ${n(liters, 1)} × ${n(raise)} ÷ 1,000 ${is(grams, 2)} g.`,
      ),
      t(
        lang,
        `Pounds: ${n(grams, places)} ÷ 453.59237 ${is(shown(grams, places).div(GRAMS_PER_POUND), 1)} lb, the figure above; ounces: ÷ 28.349523125 ${is(shown(grams, places).div(GRAMS_PER_OUNCE), 1)} oz.`,
        `Libras: ${n(grams, places)} ÷ 453.59237 ${is(shown(grams, places).div(GRAMS_PER_POUND), 1)} lb, la cifra de arriba; onzas: ÷ 28.349523125 ${is(shown(grams, places).div(GRAMS_PER_OUNCE), 1)} oz.`,
      ),
      t(
        lang,
        `Already at 10 ppm? Then the raise is 20 ppm and the dose ${out(poolStabilizer, { ...raw, current: '10' }, 'pounds')} lb; at 20 ppm, ${out(poolStabilizer, { ...raw, current: '20' }, 'pounds')} lb.`,
        `¿Ya tienes 10 ppm? Entonces el aumento es de 20 ppm y la dosis ${out(poolStabilizer, { ...raw, current: '10' }, 'pounds')} lb; con 20 ppm, ${out(poolStabilizer, { ...raw, current: '20' }, 'pounds')} lb.`,
      ),
    ],
    next: [
      {
        text: t(
          lang,
          `With CYA in the water, CDC’s chlorine floor is 2 ppm: 1 to 3 ppm in ${n(g)} gal is ${out(poolChlorine, chlorine, 'liquid')} fl oz of 12.5% liquid.`,
          `Con CYA en el agua, el mínimo de cloro de los CDC es 2 ppm: de 1 a 3 ppm en ${n(g)} gal son ${out(poolChlorine, chlorine, 'liquid')} fl oz de líquido al 12.5%.`,
        ),
        link: link('chlorine', lang, 'Pool chlorine calculator', 'Calculadora de cloro'),
      },
      {
        text: t(
          lang,
          `A public pool stays at 90 ppm of CYA or less; from ${raw.target} ppm, ${n(g)} gal are ${out(poolStabilizer, { gallons: raw.gallons, current: raw.target, target: '90' }, 'pounds')} lb away from it.`,
          `Una piscina pública se queda en 90 ppm de CYA o menos; desde ${raw.target} ppm, a ${n(g)} gal les faltan ${out(poolStabilizer, { gallons: raw.gallons, current: raw.target, target: '90' }, 'pounds')} lb para llegar.`,
        ),
        link: link(
          'dosing-chart',
          lang,
          'Pool chemical dosing chart',
          'Tabla de dosis de químicos',
        ),
      },
    ],
  };
};

const calcium: Texts = (lang) => {
  const raw = DEFAULTS.calcium;
  const g = G(raw);
  const raise = q(raw.target).sub(q(raw.current));
  const perTen = g.div(Rational.of(1000)).mul(Rational.of(2));
  const ounces = perTen.mul(raise).div(Rational.of(10));
  const pounds = ounces.div(Rational.of(16));
  const most = g.div(Rational.of(10_000)).mul(Rational.of(3));
  const split = pounds.compare(most) === 1;
  const acid = { gallons: raw.gallons, product: 'muriatic-31-45', drops: '1' };
  return {
    steps: [
      t(
        lang,
        `The label: 2 oz per 1,000 gal per 10 ppm, so ${n(g)} gal take ${n(g)} ÷ 1,000 × 2 ${is(perTen, 1)} oz for each 10 ppm.`,
        `La etiqueta: 2 oz por cada 1,000 gal por cada 10 ppm, así que ${n(g)} gal llevan ${n(g)} ÷ 1,000 × 2 ${is(perTen, 1)} oz por cada 10 ppm.`,
      ),
      t(
        lang,
        `Raise: ${raw.target} − ${raw.current} = ${n(raise)} ppm, so ${n(perTen, 1)} × ${n(raise)} ÷ 10 ${is(ounces, 1)} oz.`,
        `Aumento: ${raw.target} − ${raw.current} = ${n(raise)} ppm, así que ${n(perTen, 1)} × ${n(raise)} ÷ 10 ${is(ounces, 1)} oz.`,
      ),
      t(
        lang,
        `Pounds: ${n(ounces, 1)} ÷ 16 ${is(pounds, 1)} lb, the figure above.`,
        `Libras: ${n(ounces, 1)} ÷ 16 ${is(pounds, 1)} lb, la cifra de arriba.`,
      ),
      t(
        lang,
        `The most at a time: ${n(g)} ÷ 10,000 × 3 lb ${is(most, 1)} lb, so ${split ? 'the label splits this dose 12 hours apart' : `the ${n(pounds, 1)} lb go in at once`}.`,
        `Lo máximo por vez: ${n(g)} ÷ 10,000 × 3 lb ${is(most, 1)} lb, así que ${split ? 'la etiqueta divide esta dosis con 12 horas de separación' : `las ${n(pounds, 1)} lb van de una sola vez`}.`,
      ),
      t(
        lang,
        `Dissolve it first, about ½ lb to a gallon of water: ${n(pounds, 1)} lb take about ${n(pounds.mul(Rational.of(2)), 1)} gallons.`,
        `Disuélvelo primero, más o menos ½ lb por galón de agua: ${n(pounds, 1)} lb necesitan unos ${n(pounds.mul(Rational.of(2)), 1)} galones.`,
      ),
    ],
    next: [
      {
        text: t(
          lang,
          `Check the pH as well: 1 drop of acid demand reagent in ${n(g)} gal is ${out(poolPh, acid, 'liquid')} fl oz of muriatic acid.`,
          `Revisa también el pH: 1 gota de reactivo de demanda de ácido en ${n(g)} gal son ${out(poolPh, acid, 'liquid')} fl oz de ácido muriático.`,
        ),
        link: link('ph', lang, 'Pool pH calculator', 'Calculadora de pH'),
      },
      {
        text: t(
          lang,
          `Hayward’s AquaRite manual keeps 200 to 400 ppm; this page’s ${raw.target} ppm is the bottom of it.`,
          `El manual de AquaRite de Hayward mantiene de 200 a 400 ppm; los ${raw.target} ppm de esta página son el mínimo.`,
        ),
        link: link(
          'calcium-guide',
          lang,
          'How to raise calcium hardness',
          'Cómo subir la dureza de calcio',
        ),
      },
    ],
  };
};

const heater: Texts = (lang) => {
  const raw = DEFAULTS.heater;
  const g = G(raw);
  const rise = q(raw.rise);
  const hours = q(raw.hours);
  const water = g.mul(POUNDS_PER_GALLON);
  const btu = water.mul(rise);
  return {
    steps: [
      t(
        lang,
        `Weight: ${n(g)} gal × 8.34 lb ${is(water)} lb of water to warm.`,
        `Peso: ${n(g)} gal × 8.34 lb ${is(water)} lb de agua por calentar.`,
      ),
      t(
        lang,
        `Heat: ${n(water)} × ${n(rise)} °F ${is(btu)} BTU, one BTU for each pound and degree.`,
        `Calor: ${n(water)} × ${n(rise)} °F ${is(btu)} BTU, un BTU por cada libra y cada grado.`,
      ),
      t(
        lang,
        `Output: ${n(btu)} ÷ ${n(hours)} h ${is(btu.div(hours))} BTU/h, the figure above.`,
        `Potencia: ${n(btu)} ÷ ${n(hours)} h ${is(btu.div(hours))} BTU/h, la cifra de arriba.`,
      ),
      t(
        lang,
        `Each degree of the ${n(g)} gal is ${n(water)} BTU, ${n(water.div(hours))} BTU/h over ${n(hours)} hours, before any heat is lost to the air.`,
        `Cada grado de los ${n(g)} gal son ${n(water)} BTU, ${n(water.div(hours))} BTU/h en ${n(hours)} horas, antes de perder calor al aire.`,
      ),
    ],
    next: [
      {
        text: t(
          lang,
          `The heater warms only the water the pump sends it: ${n(g)} gal turn over in 6 hours at ${out(poolPump, DEFAULTS.pump, 'flow')} gpm.`,
          `El calentador solo calienta el agua que le manda la bomba: ${n(g)} gal dan una vuelta en 6 horas a ${out(poolPump, DEFAULTS.pump, 'flow')} gpm.`,
        ),
        link: link('pump', lang, 'Pool pump size calculator', 'Calculadora de bomba'),
      },
      {
        text: t(
          lang,
          `Not sure the pool holds ${n(g)} gal? The volume calculator works the gallons out from its shape and depths.`,
          `¿No sabes si la piscina tiene ${n(g)} gal? La calculadora de volumen saca los galones de su forma y sus profundidades.`,
        ),
        link: link('volume', lang, 'Pool volume calculator', 'Calculadora de volumen'),
      },
    ],
  };
};

const fill: Texts = (lang) => {
  const raw = DEFAULTS['fill-time'];
  const g = G(raw);
  const flow = q(raw.flow);
  const minutes = g.div(flow);
  const fresh = { gallons: raw.gallons, current: '0', target: '3200' };
  return {
    steps: [
      t(
        lang,
        `Minutes: ${n(g)} gal ÷ ${n(flow)} gpm ${is(minutes)} min.`,
        `Minutos: ${n(g)} gal ÷ ${n(flow)} gpm ${is(minutes)} min.`,
      ),
      t(
        lang,
        `Hours: ${n(minutes)} ÷ 60 ${is(minutes.div(Rational.of(60)), 2)} h, which is ${out(poolFillTime, raw, 'time')}, the figure above.`,
        `Horas: ${n(minutes)} ÷ 60 ${is(minutes.div(Rational.of(60)), 2)} h, que son ${out(poolFillTime, raw, 'time')}, la cifra de arriba.`,
      ),
      t(
        lang,
        `Days of running water: ${n(minutes)} ÷ 1,440 ${is(minutes.div(Rational.of(1440)), 2)}.`,
        `Días con el agua corriendo: ${n(minutes)} ÷ 1,440 ${is(minutes.div(Rational.of(1440)), 2)}.`,
      ),
      t(
        lang,
        `${n(flow)} gpm is a 5-gallon bucket filled in 300 ÷ ${n(flow)} = ${n(Rational.of(300).div(flow))} seconds; each second more on your bucket adds ${n(g)} ÷ 300 ${is(g.div(Rational.of(300)), 1)} minutes.`,
        `${n(flow)} gpm es una cubeta de 5 galones llena en 300 ÷ ${n(flow)} = ${n(Rational.of(300).div(flow))} segundos; cada segundo más en tu cubeta suma ${n(g)} ÷ 300 ${is(g.div(Rational.of(300)), 1)} minutos.`,
      ),
    ],
    next: [
      {
        text: t(
          lang,
          `A salt cell in the new water: from 0 to 3,200 ppm, ${n(g)} gal take ${out(poolSalt, fresh, 'pounds')} lb, ${String(run(poolSalt, fresh).get('bags'))} bags of 40 lb.`,
          `Una celda de sal en el agua nueva: de 0 a 3,200 ppm, ${n(g)} gal llevan ${out(poolSalt, fresh, 'pounds')} lb, ${String(run(poolSalt, fresh).get('bags'))} bolsas de 40 lb.`,
        ),
        link: link('salt', lang, 'Pool salt calculator', 'Calculadora de sal'),
      },
      {
        text: t(
          lang,
          `Warming the new ${n(g)} gal by 10 °F in a day takes ${out(poolHeater, DEFAULTS.heater, 'btuPerHour')} BTU/h.`,
          `Calentar los ${n(g)} gal nuevos 10 °F en un día pide ${out(poolHeater, DEFAULTS.heater, 'btuPerHour')} BTU/h.`,
        ),
        link: link('heater', lang, 'Pool heater size calculator', 'Calculadora de calentador'),
      },
    ],
  };
};

const volume: Texts = (lang) => {
  const raw = DEFAULTS.volume;
  const ran = run(poolVolume, raw);
  const gallons = ran.get('gallons');
  if (!isQuantityOf(gallons, 'volume')) throw new Error('gallons must be a volume');
  const length = Rational.of(32);
  const width = Rational.of(16);
  const depth = Rational.of(7, 2).add(Rational.of(8)).div(Rational.of(2));
  const area = length.mul(width);
  const cubic = area.mul(depth);
  const exact = cubic.mul(Rational.of(1728)).div(Rational.of(231));
  const whole = String(Math.round(valueIn(gallons, gal).toNumber()));
  const size = volumeText(gallons, gal);
  const pool = { gallons: whole };
  const chlorine = { gallons: whole, current: '1', target: '3', product: 'liquid-12-5' };
  const round = Rational.of(24 * 24)
    .mul(PI)
    .div(Rational.of(4));
  return {
    steps: [
      t(lang, `Surface: 32 × 16 = ${n(area)} ft².`, `Superficie: 32 × 16 = ${n(area)} ft².`),
      t(
        lang,
        `Average depth: (3.5 + 8) ÷ 2 ${is(depth, 2)} ft, from 3 ft 6 in at one end to 8 ft at the other.`,
        `Profundidad promedio: (3.5 + 8) ÷ 2 ${is(depth, 2)} ft, de 3 ft 6 in en un extremo a 8 ft en el otro.`,
      ),
      t(
        lang,
        `Volume: ${n(area)} × ${n(depth, 2)} ${is(cubic, 1)} ft³, the cubic feet above (${volumeText(gallons, ft3, 1)}).`,
        `Volumen: ${n(area)} × ${n(depth, 2)} ${is(cubic, 1)} ft³, los pies cúbicos de arriba (${volumeText(gallons, ft3, 1)}).`,
      ),
      t(
        lang,
        `Gallons, at 231 in³ each: ${n(cubic, 1)} × 1,728 ÷ 231 ${is(cubic.mul(Rational.of(1728)).div(Rational.of(231)))}; liters: ${n(exact, 3)} × 3.785411784 ${is(shown(exact, 3).mul(LITERS_PER_GALLON))}.`,
        `Galones, a 231 in³ cada uno: ${n(cubic, 1)} × 1,728 ÷ 231 ${is(cubic.mul(Rational.of(1728)).div(Rational.of(231)))}; litros: ${n(exact, 3)} × 3.785411784 ${is(shown(exact, 3).mul(LITERS_PER_GALLON))}.`,
      ),
      t(
        lang,
        `A round pool 24 ft across starts from π × 24² ÷ 4 ${is(round, 1)} ft² instead; an oval from π × length × width ÷ 4.`,
        `Una piscina redonda de 24 ft de diámetro parte de π × 24² ÷ 4 ${is(round, 1)} ft²; una ovalada, de π × largo × ancho ÷ 4.`,
      ),
    ],
    next: [
      {
        text: t(
          lang,
          `Its pump: ${size} gal turned over in 6 hours is ${out(poolPump, pool, 'flow')} gpm.`,
          `Su bomba: ${size} gal en una vuelta de 6 horas son ${out(poolPump, pool, 'flow')} gpm.`,
        ),
        link: link('pump', lang, 'Pool pump size calculator', 'Calculadora de bomba'),
      },
      {
        text: t(
          lang,
          `Its chlorine: 1 to 3 ppm in ${size} gal is ${out(poolChlorine, chlorine, 'liquid')} fl oz of 12.5% liquid.`,
          `Su cloro: de 1 a 3 ppm en ${size} gal son ${out(poolChlorine, chlorine, 'liquid')} fl oz de líquido al 12.5%.`,
        ),
        link: link('chlorine', lang, 'Pool chlorine calculator', 'Calculadora de cloro'),
      },
      {
        text: t(
          lang,
          `Other sizes: the chart gives the gallons of every common pool at its usual depths.`,
          `Otros tamaños: la tabla da los galones de cada piscina común a sus profundidades usuales.`,
        ),
        link: link('volume-chart', lang, 'Pool volume chart', 'Tabla de volumen de piscina'),
      },
    ],
  };
};

const TEXTS: Readonly<Record<CalculatorId, Texts>> = {
  volume,
  salt,
  chlorine,
  pump,
  ph,
  alkalinity,
  stabilizer,
  calcium,
  heater,
  'fill-time': fill,
};

const isCalculatorId = (id: string): id is CalculatorId => id in TEXTS;

/** The worked example of the calculator page at `path`, in its language. */
export const calculatorWorkedOf = (path: string): CalculatorWorked => {
  const id = routeOf(path)?.id ?? '';
  if (!isCalculatorId(id)) throw new Error(`${path} is not a calculator page`);
  const lang = langOf(path);
  const { steps, next } = TEXTS[id](lang);
  return {
    heading: lang === 'en' ? 'How the figures are worked out' : 'Cómo se calcula, paso a paso',
    steps,
    next: {
      heading: lang === 'en' ? 'What to work out next' : 'Qué calcular después',
      items: next,
    },
  };
};
