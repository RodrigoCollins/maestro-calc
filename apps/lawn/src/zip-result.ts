/** The dates file of one state (`data/frost/<slug>.json`, `src/frost-json.ts`). */
export interface StateData {
  readonly name: string;
  readonly stations: Readonly<Record<string, readonly (number | string | null)[]>>;
}

export interface ZipMatchLike {
  readonly stationId: string;
  readonly stationState: string;
  readonly miles: number;
}

export interface ZipResult {
  /** The sentence for the result: the station, its distance and its six dates. */
  readonly text: string;
  /** The row of the station on its state page. */
  readonly href: string;
  readonly linkLabel: string;
}

/**
 * What the ZIP lookup says for `zip`: the nearest station, its distance in miles, the last spring
 * and first fall freeze at 10, 50 and 90 percent, and the address of its row; `undefined` when the
 * state file does not hold the station.
 */
export const zipResultOf = (
  zip: string,
  match: ZipMatchLike,
  data: StateData,
  text: {
    readonly dateText: (day: number | null) => string;
    readonly titleCase: (name: string) => string;
  },
): ZipResult | undefined => {
  const row = data.stations[match.stationId];
  if (row === undefined) return undefined;
  const [part, name, ...days] = row;
  const dates = days.map((day) => text.dateText(day as number | null));
  const station = text.titleCase(String(name));
  const away = match.miles === 1 ? '1 mile' : `${String(match.miles)} miles`;
  const free = dates.every((date) => date === text.dateText(null));
  const spring = `${dates[0] ?? ''}, ${dates[1] ?? ''}, ${dates[2] ?? ''}`;
  const fall = `${dates[3] ?? ''}, ${dates[4] ?? ''}, ${dates[5] ?? ''}`;
  const first = `Nearest station to ${zip}: ${station}, ${data.name}, ${away} away.`;
  return {
    text: free
      ? `${first} NOAA flags it with freeze risk all year, so it gives no dates.`
      : `${first} Last spring freeze (32°F) at 10%, 50%, 90%: ${spring}. First fall freeze: ${fall}.`,
    href: `/frost-dates/${match.stationState}${part === 1 ? '' : `/${String(part)}`}#${match.stationId}`,
    linkLabel: 'See its row',
  };
};
