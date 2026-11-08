import type { Station } from '@maestro-calc/lawn-data/frost/types';
import { STATIONS as ALABAMA } from '@maestro-calc/lawn-data/frost/alabama';
import { STATIONS as ALASKA } from '@maestro-calc/lawn-data/frost/alaska';
import { STATIONS as ARIZONA } from '@maestro-calc/lawn-data/frost/arizona';
import { STATIONS as ARKANSAS } from '@maestro-calc/lawn-data/frost/arkansas';
import { STATIONS as CALIFORNIA } from '@maestro-calc/lawn-data/frost/california';
import { STATIONS as COLORADO } from '@maestro-calc/lawn-data/frost/colorado';
import { STATIONS as CONNECTICUT } from '@maestro-calc/lawn-data/frost/connecticut';
import { STATIONS as DELAWARE } from '@maestro-calc/lawn-data/frost/delaware';
import { STATIONS as DISTRICT_OF_COLUMBIA } from '@maestro-calc/lawn-data/frost/district-of-columbia';
import { STATIONS as FLORIDA } from '@maestro-calc/lawn-data/frost/florida';
import { STATIONS as GEORGIA } from '@maestro-calc/lawn-data/frost/georgia';
import { STATIONS as HAWAII } from '@maestro-calc/lawn-data/frost/hawaii';
import { STATIONS as IDAHO } from '@maestro-calc/lawn-data/frost/idaho';
import { STATIONS as ILLINOIS } from '@maestro-calc/lawn-data/frost/illinois';
import { STATIONS as INDIANA } from '@maestro-calc/lawn-data/frost/indiana';
import { STATIONS as IOWA } from '@maestro-calc/lawn-data/frost/iowa';
import { STATIONS as KANSAS } from '@maestro-calc/lawn-data/frost/kansas';
import { STATIONS as KENTUCKY } from '@maestro-calc/lawn-data/frost/kentucky';
import { STATIONS as LOUISIANA } from '@maestro-calc/lawn-data/frost/louisiana';
import { STATIONS as MAINE } from '@maestro-calc/lawn-data/frost/maine';
import { STATIONS as MARYLAND } from '@maestro-calc/lawn-data/frost/maryland';
import { STATIONS as MASSACHUSETTS } from '@maestro-calc/lawn-data/frost/massachusetts';
import { STATIONS as MICHIGAN } from '@maestro-calc/lawn-data/frost/michigan';
import { STATIONS as MINNESOTA } from '@maestro-calc/lawn-data/frost/minnesota';
import { STATIONS as MISSISSIPPI } from '@maestro-calc/lawn-data/frost/mississippi';
import { STATIONS as MISSOURI } from '@maestro-calc/lawn-data/frost/missouri';
import { STATIONS as MONTANA } from '@maestro-calc/lawn-data/frost/montana';
import { STATIONS as NEBRASKA } from '@maestro-calc/lawn-data/frost/nebraska';
import { STATIONS as NEVADA } from '@maestro-calc/lawn-data/frost/nevada';
import { STATIONS as NEW_HAMPSHIRE } from '@maestro-calc/lawn-data/frost/new-hampshire';
import { STATIONS as NEW_JERSEY } from '@maestro-calc/lawn-data/frost/new-jersey';
import { STATIONS as NEW_MEXICO } from '@maestro-calc/lawn-data/frost/new-mexico';
import { STATIONS as NEW_YORK } from '@maestro-calc/lawn-data/frost/new-york';
import { STATIONS as NORTH_CAROLINA } from '@maestro-calc/lawn-data/frost/north-carolina';
import { STATIONS as NORTH_DAKOTA } from '@maestro-calc/lawn-data/frost/north-dakota';
import { STATIONS as OHIO } from '@maestro-calc/lawn-data/frost/ohio';
import { STATIONS as OKLAHOMA } from '@maestro-calc/lawn-data/frost/oklahoma';
import { STATIONS as OREGON } from '@maestro-calc/lawn-data/frost/oregon';
import { STATIONS as PENNSYLVANIA } from '@maestro-calc/lawn-data/frost/pennsylvania';
import { STATIONS as RHODE_ISLAND } from '@maestro-calc/lawn-data/frost/rhode-island';
import { STATIONS as SOUTH_CAROLINA } from '@maestro-calc/lawn-data/frost/south-carolina';
import { STATIONS as SOUTH_DAKOTA } from '@maestro-calc/lawn-data/frost/south-dakota';
import { STATIONS as TENNESSEE } from '@maestro-calc/lawn-data/frost/tennessee';
import { STATIONS as TEXAS } from '@maestro-calc/lawn-data/frost/texas';
import { STATIONS as UTAH } from '@maestro-calc/lawn-data/frost/utah';
import { STATIONS as VERMONT } from '@maestro-calc/lawn-data/frost/vermont';
import { STATIONS as VIRGINIA } from '@maestro-calc/lawn-data/frost/virginia';
import { STATIONS as WASHINGTON } from '@maestro-calc/lawn-data/frost/washington';
import { STATIONS as WEST_VIRGINIA } from '@maestro-calc/lawn-data/frost/west-virginia';
import { STATIONS as WISCONSIN } from '@maestro-calc/lawn-data/frost/wisconsin';
import { STATIONS as WYOMING } from '@maestro-calc/lawn-data/frost/wyoming';

/** The stations of each state, by its slug (`@maestro-calc/lawn-data/frost/states`). */
export const STATIONS_OF: Readonly<Record<string, readonly Station[]>> = {
  alabama: ALABAMA,
  alaska: ALASKA,
  arizona: ARIZONA,
  arkansas: ARKANSAS,
  california: CALIFORNIA,
  colorado: COLORADO,
  connecticut: CONNECTICUT,
  delaware: DELAWARE,
  'district-of-columbia': DISTRICT_OF_COLUMBIA,
  florida: FLORIDA,
  georgia: GEORGIA,
  hawaii: HAWAII,
  idaho: IDAHO,
  illinois: ILLINOIS,
  indiana: INDIANA,
  iowa: IOWA,
  kansas: KANSAS,
  kentucky: KENTUCKY,
  louisiana: LOUISIANA,
  maine: MAINE,
  maryland: MARYLAND,
  massachusetts: MASSACHUSETTS,
  michigan: MICHIGAN,
  minnesota: MINNESOTA,
  mississippi: MISSISSIPPI,
  missouri: MISSOURI,
  montana: MONTANA,
  nebraska: NEBRASKA,
  nevada: NEVADA,
  'new-hampshire': NEW_HAMPSHIRE,
  'new-jersey': NEW_JERSEY,
  'new-mexico': NEW_MEXICO,
  'new-york': NEW_YORK,
  'north-carolina': NORTH_CAROLINA,
  'north-dakota': NORTH_DAKOTA,
  ohio: OHIO,
  oklahoma: OKLAHOMA,
  oregon: OREGON,
  pennsylvania: PENNSYLVANIA,
  'rhode-island': RHODE_ISLAND,
  'south-carolina': SOUTH_CAROLINA,
  'south-dakota': SOUTH_DAKOTA,
  tennessee: TENNESSEE,
  texas: TEXAS,
  utah: UTAH,
  vermont: VERMONT,
  virginia: VIRGINIA,
  washington: WASHINGTON,
  'west-virginia': WEST_VIRGINIA,
  wisconsin: WISCONSIN,
  wyoming: WYOMING,
};
