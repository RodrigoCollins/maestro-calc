import { describe, expect, it } from 'vitest';
import { DOG_HEAT_GUIDE } from './dog-heat-guide.ts';
import { ROUTES } from './routes.ts';

const guide = DOG_HEAT_GUIDE;
const text = JSON.stringify(guide);

describe('dog in heat', () => {
  it('asks the question people search in its title and h1, at its address', () => {
    expect(guide.path).toBe('/dog-in-heat');
    expect(guide.title).toBe('Dog in Heat: How Long Does It Last? | Bowl Figures');
    expect(guide.h1).toBe('Dog in heat: how long does it last?');
    expect(ROUTES.find(({ path }) => path === guide.path)?.kind).toBe('article');
  });

  // proestrus about 9 days + estrus about 9 days (Merck) = about 18 days
  it('answers first: about 18 days of proestrus and estrus, about every 7 months', () => {
    expect(guide.lead).toContain('about 18 days');
    expect(guide.lead).toContain('every 7 months');
  });

  it('gives Merck’s stage lengths in a table, one row per stage', () => {
    expect(guide.table?.rows.map(([stage]) => stage)).toEqual([
      'Proestrus',
      'Estrus',
      'Diestrus',
      'Anestrus',
    ]);
    expect(guide.table?.rows[0]).toContain('About 9 days');
    expect(guide.table?.rows[0]).toContain('2 days to 3 weeks');
    expect(guide.table?.rows[1]).toContain('3 days to 3 weeks');
    expect(guide.table?.rows[3]).toContain('1 to 6 months');
    for (const cells of guide.table?.rows ?? []) expect(cells).toHaveLength(4);
    expect(guide.table?.links.map(({ href }) => href)).toEqual(['/dog-pregnancy-calculator']);
  });

  it('gives the first heat by size and the interval of 4 to 13 months', () => {
    expect(text).toContain('6 to 24 months');
    expect(text).toContain('12 to 16 months');
    expect(text).toContain('4 to 13 months');
  });

  it('names the signs of pyometra and sends the reader to a veterinarian', () => {
    expect(text).toContain('pyometra');
    expect(text).toContain('4 weeks to 4 months');
    expect(text).toContain('call your veterinarian');
  });

  it('has a FAQ, links the due date calculator and cites Merck, Cornell and AKC', () => {
    expect(guide.questions?.length).toBeGreaterThanOrEqual(4);
    expect(guide.calculators).toEqual(['/dog-pregnancy-calculator']);
    const urls = guide.sources.map(({ url }) => url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toContain('https://www.vet.cornell.edu/dog-estrous-cycles');
    expect(urls).toContain(
      'https://www.merckvetmanual.com/dog-owners/reproductive-disorders-of-dogs/management-of-reproduction-in-dogs',
    );
    expect(urls).toContain('https://www.akc.org/expert-advice/dog-breeding/dogs-in-heat/');
    expect(guide.checked).toBe('2026-11-10');
  });
});
