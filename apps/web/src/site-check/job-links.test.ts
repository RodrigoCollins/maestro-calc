import { describe, expect, it } from 'vitest';
import { calculatorSite, jobSite, validDist } from './__testing__/page-fixture.ts';
import { contextOf } from './checks.ts';
import { jobLinkProblems } from './job-links.ts';
import type { Dist, Site } from './types.ts';

/** The valid dist of `site` with `from` replaced by `to` in the named file. */
const edited = (site: Site, file: string, from: RegExp, to: string): Map<string, string> => {
  const dist = validDist(site);
  dist.set(file, (dist.get(file) ?? '').replace(from, to));
  return dist;
};

const messagesOf = (dist: Dist, site: Site): string[] =>
  jobLinkProblems(contextOf(dist, site, new Map())).map(
    ({ file, rule, message }) => `${file} ${rule}: ${message}`,
  );

// spec: growth › lever 1, the job pages: linked from their calculator and hub, linking back and across
describe('job page links (growth › job pages › check:site)', () => {
  it('asks nothing of a site without job pages', () => {
    expect(messagesOf(validDist(calculatorSite()), calculatorSite())).toEqual([]);
  });

  it('accepts a valid build: every link in both languages', () => {
    expect(messagesOf(validDist(jobSite()), jobSite())).toEqual([]);
  });

  it('names each job a calculator page does not list, per language', () => {
    const dist = validDist(jobSite());
    for (const file of ['concrete-calculator.html', 'es/calculadora-de-concreto.html']) {
      dist.set(file, (dist.get(file) ?? '').replace(/<aside class="job-links".*?<\/aside>/, ''));
    }
    expect(messagesOf(dist, jobSite())).toEqual([
      'concrete-calculator.html job-link: the calculator page must list its job /concrete-slab-10x10',
      'concrete-calculator.html job-link: the calculator page must list its job /concrete-slab-12x12',
      'concrete-calculator.html job-link: the calculator page must list its job /concrete-tube-12',
      'es/calculadora-de-concreto.html job-link: the calculator page must list its job /es/losa-de-concreto-10x10',
      'es/calculadora-de-concreto.html job-link: the calculator page must list its job /es/losa-de-concreto-12x12',
      'es/calculadora-de-concreto.html job-link: the calculator page must list its job /es/tubo-de-concreto-12',
    ]);
  });

  it('names a job the hub does not list', () => {
    const dist = edited(
      jobSite(),
      'concrete.html',
      /<li><a href="\/concrete-tube-12">.*?<\/li>/,
      '',
    );
    expect(messagesOf(dist, jobSite())).toEqual([
      'concrete.html job-link: the hub must list its job /concrete-tube-12',
    ]);
  });

  it('names a job page that does not link its calculator', () => {
    const dist = edited(
      jobSite(),
      'concrete-slab-12x12.html',
      // the body link and the breadcrumb's crumb: either one links the calculator
      /<p class="job-calculator">.*?<\/p>|<li><a href="\/concrete-calculator">[^<]*<\/a><\/li>/g,
      '',
    );
    expect(messagesOf(dist, jobSite())).toEqual([
      'concrete-slab-12x12.html job-link: the job page must link its calculator /concrete-calculator',
    ]);
  });

  it('counts a calculator link with a prefilled state as a link to the calculator', () => {
    const dist = edited(
      jobSite(),
      'concrete-slab-12x12.html',
      /href="\/concrete-calculator"/g,
      'href="/concrete-calculator?length=12ft&amp;width=12ft#calc-result-heading"',
    );
    expect(messagesOf(dist, jobSite())).toEqual([]);
  });

  it('names each nearest sibling a job page does not link: the one before and the one after', () => {
    const dist = edited(
      jobSite(),
      'concrete-slab-12x12.html',
      /<ul class="job-more">.*?<\/ul>/,
      '',
    );
    expect(messagesOf(dist, jobSite())).toEqual([
      'concrete-slab-12x12.html job-link: the job page must link its sibling /concrete-slab-10x10',
      'concrete-slab-12x12.html job-link: the job page must link its sibling /concrete-tube-12',
    ]);
  });

  it('asks the first and the last job for their one neighbour only', () => {
    const site = jobSite();
    const dist = validDist(site);
    dist.set(
      'concrete-slab-10x10.html',
      (dist.get('concrete-slab-10x10.html') ?? '').replace(
        /<li><a href="\/concrete-tube-12">.*?<\/li>/,
        '',
      ),
    );
    dist.set(
      'concrete-tube-12.html',
      (dist.get('concrete-tube-12.html') ?? '').replace(
        /<li><a href="\/concrete-slab-10x10">.*?<\/li>/,
        '',
      ),
    );
    expect(messagesOf(dist, site)).toEqual([]);
  });

  // content audit 2026-11-08: the question pages chain among themselves, not with the size jobs
  it('chains a job of its own group among that group only', () => {
    const drop = (site: Site) =>
      edited(site, 'concrete-slab-12x12.html', /<li><a href="\/concrete-tube-12">.*?<\/li>/, '');
    const grouped = { ...jobSite(), jobGroups: { 'concrete-tube-12': 'question' } };
    expect(messagesOf(drop(grouped), grouped)).toEqual([]);
    expect(messagesOf(drop(jobSite()), jobSite())).toEqual([
      'concrete-slab-12x12.html job-link: the job page must link its sibling /concrete-tube-12',
    ]);
  });

  it('rejects a link to the other language', () => {
    const dist = edited(
      jobSite(),
      'es/losa-de-concreto-12x12.html',
      /href="\/es\/calculadora-de-concreto"/g,
      'href="/concrete-calculator"',
    );
    expect(messagesOf(dist, jobSite())).toEqual([
      'es/losa-de-concreto-12x12.html job-link: the job page must link its calculator /es/calculadora-de-concreto',
    ]);
  });

  it('counts a link with no href as missing', () => {
    const dist = edited(jobSite(), 'concrete-calculator.html', /href="\/concrete-tube-12"/, '');
    expect(messagesOf(dist, jobSite())).toEqual([
      'concrete-calculator.html job-link: the calculator page must list its job /concrete-tube-12',
    ]);
  });

  it('asks no hub of a job whose calculator has none', () => {
    const site = { ...jobSite(), hubs: {} };
    const dist = validDist(site);
    expect(messagesOf(dist, site)).toEqual([]);
  });

  it('leaves a missing page to the file set', () => {
    const dist = validDist(jobSite());
    dist.delete('concrete-calculator.html');
    dist.delete('concrete.html');
    dist.delete('concrete-slab-12x12.html');
    expect(messagesOf(dist, jobSite())).toEqual([]);
  });
});
