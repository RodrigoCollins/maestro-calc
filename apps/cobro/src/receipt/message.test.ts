import { describe, expect, it } from 'vitest';
import { quoteMessage, sharedUrlOf, whatsappHref } from './message.ts';

describe('quoteMessage', () => {
  it('itemizes the lines, the total and the address, one per line', () => {
    const text = quoteMessage(
      'PRESUPUESTO — Pintura',
      [
        { label: 'Mano de obra', detail: '8 h × $25.00/h', amount: '$200.00' },
        { label: 'Subtotal', detail: '', amount: '$200.00' },
      ],
      { label: 'TOTAL', detail: '', amount: '$200.00' },
      'https://cuantolecobro.com/x',
    );
    expect(text).toBe(
      'PRESUPUESTO — Pintura\nMano de obra (8 h × $25.00/h): $200.00\nSubtotal: $200.00\nTOTAL: $200.00\nhttps://cuantolecobro.com/x',
    );
  });
});

describe('whatsappHref', () => {
  it('encodes the message into a wa.me link', () => {
    expect(whatsappHref('a b\nc')).toBe('https://wa.me/?text=a%20b%0Ac');
  });
});

describe('sharedUrlOf', () => {
  const href = 'http://localhost:8792/embed/x?hr=3';

  it('moves the state onto the canonical path', () => {
    expect(sharedUrlOf('https://cuantolecobro.com/x', href)).toBe('http://localhost:8792/x?hr=3');
  });

  it('keeps the address without a usable canonical', () => {
    expect(sharedUrlOf(null, href)).toBe(href);
    expect(sharedUrlOf('/x', href)).toBe(href);
  });
});
