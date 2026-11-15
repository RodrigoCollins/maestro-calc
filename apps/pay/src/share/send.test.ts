import { describe, expect, it } from 'vitest';
import { canShare, sendText } from './send.ts';

const text = 'My hours this week\nTotal: 40 h';

describe('sendText', () => {
  it('copies the text and opens the share sheet where both exist, starting both in the click', async () => {
    const calls: string[] = [];
    const sent = sendText(
      {
        clipboard: {
          writeText: (value: string) => {
            calls.push(`copy ${value}`);
            return Promise.resolve();
          },
        },
        share: (data: { text: string }) => {
          calls.push(`share ${data.text}`);
          return Promise.resolve();
        },
      },
      text,
    );
    // both calls run before the first await, inside the click's user activation
    expect(calls).toEqual([`copy ${text}`, `share ${text}`]);
    expect(await sent).toEqual({ copied: true, shared: true });
  });

  it('only copies where there is no share sheet (a desktop browser)', async () => {
    expect(await sendText({ clipboard: { writeText: () => Promise.resolve() } }, text)).toEqual({
      copied: true,
      shared: false,
    });
  });

  it('reports a share sheet closed without sharing, and a copy refused', async () => {
    const sent = await sendText(
      {
        clipboard: { writeText: () => Promise.reject(new Error('NotAllowedError')) },
        share: () => Promise.reject(new Error('AbortError')),
      },
      text,
    );
    expect(sent).toEqual({ copied: false, shared: false });
  });

  it('never throws where the clipboard is missing or throws at once', async () => {
    expect(await sendText({}, text)).toEqual({ copied: false, shared: false });
    const throwing = {
      clipboard: {
        writeText: (): Promise<void> => {
          throw new Error('SecurityError');
        },
      },
    };
    expect(await sendText(throwing, text)).toEqual({ copied: false, shared: false });
  });
});

describe('canShare', () => {
  it('tells a browser with a share sheet from one without', () => {
    expect(canShare({ share: () => Promise.resolve() })).toBe(true);
    expect(canShare({})).toBe(false);
  });
});
