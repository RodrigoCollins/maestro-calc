import { gal, isQuantityOf } from '@maestro-calc/core';
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
import {
  ALKALINITY,
  CALCIUM,
  CHLORINE,
  FILL_TIME,
  HEATER,
  PH,
  PUMP,
  SALT,
  STABILIZER,
} from '../doses.ts';
import { outputText, volumeText } from '../format.ts';
import { VOLUME_TEXTS } from '../volume/texts.ts';

/** The engine of each calculator page, by its path. */
const ENGINES = {
  [VOLUME_TEXTS.path]: poolVolume,
  [SALT.path]: poolSalt,
  [CHLORINE.path]: poolChlorine,
  [PUMP.path]: poolPump,
  [PH.path]: poolPh,
  [ALKALINITY.path]: poolAlkalinity,
  [STABILIZER.path]: poolStabilizer,
  [CALCIUM.path]: poolCalcium,
  [HEATER.path]: poolHeater,
  [FILL_TIME.path]: poolFillTime,
} as const;

/**
 * The text of one output of the engine of the calculator at `path`, as its page writes it: a
 * published figure (methodology, guides) is held to this, to the digit.
 */
export const figure = (
  path: string,
  raw: Readonly<Record<string, string>>,
  key: string,
): string => {
  const engine = ENGINES[path];
  if (engine === undefined) throw new Error(`no engine for ${path}`);
  const ran = engine.run(raw);
  if (!ran.ok) throw new Error(`${path} did not run`);
  const value = ran.value.outputs.find((output) => output.key === key)?.value;
  return isQuantityOf(value, 'volume') && key === 'gallons'
    ? volumeText(value, gal)
    : outputText(key, value);
};
