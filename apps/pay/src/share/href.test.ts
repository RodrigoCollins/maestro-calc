import { describe, expect, it } from 'vitest';
import { shareMessage, sharedUrlOf, whatsappHref } from './href.ts';

describe('sharedUrlOf', () => {
  it('shares the page itself, with its state in the query', () => {
    expect(
      sharedUrlOf(
        'https://cuentahoras.com/time-card-calculator',
        'http://localhost:8788/time-card-calculator?v=1&a=2',
      ),
    ).toBe('http://localhost:8788/time-card-calculator?v=1&a=2');
  });

  // an embed's canonical is the full page: a link sent from another site's frame opens it
  it('shares the full page from its embed, on the same origin', () => {
    expect(
      sharedUrlOf(
        'https://cuentahoras.com/time-card-calculator',
        'https://cuentahoras.com/embed/time-card-calculator?v=1&a=2',
      ),
    ).toBe('https://cuentahoras.com/time-card-calculator?v=1&a=2');
  });

  it('keeps the address when the page has no canonical or a broken one', () => {
    const here = 'https://cuentahoras.com/embed/time-card-calculator';
    expect(sharedUrlOf(null, here)).toBe(here);
    expect(sharedUrlOf('not a url', here)).toBe(here);
  });
});

describe('whatsappHref', () => {
  it('opens WhatsApp with the message encoded', () => {
    expect(whatsappHref('a b\nc&d')).toBe('https://wa.me/?text=a%20b%0Ac%26d');
  });
});

describe('shareMessage', () => {
  it('puts the address on a line of its own after the text', () => {
    expect(shareMessage('Overtime calculator, free on Cuenta Horas:', 'https://x.test/a?b=1')).toBe(
      'Overtime calculator, free on Cuenta Horas:\nhttps://x.test/a?b=1',
    );
  });
});
