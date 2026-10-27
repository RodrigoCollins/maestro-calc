import { describe, expect, it } from 'vitest';
import { stringsIn, stripComments } from './source-text.ts';

describe('stripComments', () => {
  it('removes a line comment and keeps the line break', () => {
    expect(stripComments('const a = 1; // one\nconst b = 2;')).toBe('const a = 1; \nconst b = 2;');
  });

  it('removes a block comment', () => {
    expect(stripComments('const a = /* one */ 1;')).toBe('const a =  1;');
  });

  it('keeps a comment marker inside a string literal', () => {
    expect(stripComments(`const url = 'https://example.com/'; // the site`)).toBe(
      `const url = 'https://example.com/'; \n`,
    );
    expect(stripComments('const text = "a /* b */ c";')).toBe('const text = "a /* b */ c";');
    expect(stripComments('const quote = `it\\`s // here`;')).toBe(
      'const quote = `it\\`s // here`;',
    );
  });

  // judgment G3: an unterminated block comment ended the scan at the start of the source
  it('treats an unterminated block comment as a comment to the end of the source', () => {
    expect(stripComments('const a = 1;\n/* never closed\nconst b = 2;')).toBe('const a = 1;\n');
    expect(stripComments('/*')).toBe('');
  });
});

describe('stringsIn', () => {
  it('lists the text of every string literal, the quotes removed', () => {
    expect(stringsIn(`a('one', "two", \`three \${x}\`)`)).toEqual(['one', 'two', 'three ${x}']);
  });

  it('keeps an escaped quote inside the literal', () => {
    expect(stringsIn(`'it\\'s'`)).toEqual(["it\\'s"]);
  });
});
