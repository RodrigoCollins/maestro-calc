import { DATA_PAGES } from '../data/pages.ts';
import {
  FULL_TIME_GUIDE,
  FULL_TIME_GUIDE_PATHS,
  PART_TIME_GUIDE,
  PART_TIME_GUIDE_PATHS,
} from '../guide/full-part-time.ts';
import { HOURS_WORKED_GUIDE } from '../guide/hours-worked.ts';
import { OVERTIME_GUIDE_PATHS, OVERTIME_GUIDES } from '../guide/overtime.ts';
import {
  HOURS_WORKED_GUIDE_PATHS,
  PAY_STUB_GUIDE_PATHS,
  PTO_GUIDE_PATHS,
  SHIFT_GUIDE_PATHS,
  TIP_CREDIT_GUIDE_PATHS,
  UNPAID_WAGES_GUIDE_PATHS,
  W2_BOX_12_GUIDE_PATHS,
} from '../guide/paths.ts';
import { PAY_STUB_GUIDE } from '../guide/pay-stub.ts';
import { PTO_GUIDE } from '../guide/pto.ts';
import { SHIFT_GUIDE } from '../guide/shift-differential.ts';
import { GUIDE_PATHS, GUIDE_TEXTS, type GuideSource, type GuideTexts } from '../guide/texts.ts';
import { TIP_CREDIT_GUIDE } from '../guide/tip-credit.ts';
import { UNPAID_WAGES_GUIDE } from '../guide/unpaid-wages.ts';
import { W2_BOX_12_GUIDE } from '../guide/w2-box-12.ts';
import { STATE_FACTS, statePageOf } from '../states/pages.ts';
import type { Lang } from '../time-card/receipt.ts';

/**
 * A page that carries the byline of the editorial team under its h1: its address, the day its
 * data says its figures were last checked (`YYYY-MM-DD`), and the address of every source the
 * sources it links (`#sources`) must list.
 */
export interface BylinePage {
  readonly path: string;
  readonly checked: string;
  readonly sources: readonly string[];
}

/** Each source once, by its address, in the order the page cites them. */
export const uniqueSources = (sources: readonly GuideSource[]): GuideSource[] =>
  sources.filter(({ href }, at) => sources.findIndex((each) => each.href === href) === at);

/** The sources a guide cites, section by section, each once. */
export const guideSourcesOf = (texts: GuideTexts): GuideSource[] =>
  uniqueSources(texts.sections.flatMap(({ sources }) => sources));

/** The guides of `GuidePage`, each with its texts and its paths. */
export const BYLINE_GUIDES: readonly {
  readonly paths: Readonly<Record<Lang, string>>;
  readonly texts: Readonly<Record<Lang, GuideTexts>>;
}[] = [
  { paths: GUIDE_PATHS, texts: GUIDE_TEXTS },
  { paths: W2_BOX_12_GUIDE_PATHS, texts: W2_BOX_12_GUIDE },
  { paths: OVERTIME_GUIDE_PATHS.federal, texts: OVERTIME_GUIDES.federal },
  { paths: OVERTIME_GUIDE_PATHS.california, texts: OVERTIME_GUIDES.california },
  { paths: PAY_STUB_GUIDE_PATHS, texts: PAY_STUB_GUIDE },
  { paths: UNPAID_WAGES_GUIDE_PATHS, texts: UNPAID_WAGES_GUIDE },
  { paths: PTO_GUIDE_PATHS, texts: PTO_GUIDE },
  { paths: SHIFT_GUIDE_PATHS, texts: SHIFT_GUIDE },
  { paths: TIP_CREDIT_GUIDE_PATHS, texts: TIP_CREDIT_GUIDE },
  { paths: HOURS_WORKED_GUIDE_PATHS, texts: HOURS_WORKED_GUIDE },
  { paths: FULL_TIME_GUIDE_PATHS, texts: FULL_TIME_GUIDE },
  { paths: PART_TIME_GUIDE_PATHS, texts: PART_TIME_GUIDE },
];

const LANGS = ['en', 'es'] as const;
const hrefs = (sources: readonly GuideSource[]): string[] => sources.map(({ href }) => href);

/**
 * Every page with a byline, in both languages: the guides (the day each says it was checked), the
 * tables of the data index (the day the index says each was checked, all its sources under the
 * table) and the state pages (the oldest checked day of their three tables, `statePageOf`).
 */
export const BYLINE_PAGES: readonly BylinePage[] = [
  ...BYLINE_GUIDES.flatMap(({ paths, texts }) =>
    LANGS.map((lang) => ({
      path: paths[lang],
      checked: texts[lang].checked,
      sources: hrefs(guideSourcesOf(texts[lang])),
    })),
  ),
  ...DATA_PAGES.flatMap(({ paths, checked, sources }) =>
    LANGS.map((lang) => ({
      path: paths[lang],
      checked,
      sources: hrefs(uniqueSources(Object.values(sources))),
    })),
  ),
  ...STATE_FACTS.flatMap((facts) =>
    LANGS.map((lang) => {
      const page = statePageOf(facts, lang);
      return { path: page.paths[lang], checked: page.reviewed, sources: hrefs(page.sources) };
    }),
  ),
];
