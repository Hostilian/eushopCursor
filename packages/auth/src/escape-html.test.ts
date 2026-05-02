import { describe, expect, it } from 'vitest';
import { escapeHtmlAttr } from './escape-html';

describe('escapeHtmlAttr', () => {
  it('escapes ampersand, quotes, and angle brackets for use in HTML attributes', () => {
    expect(escapeHtmlAttr('a&b"c<d')).toBe('a&amp;b&quot;c&lt;d');
  });

  it('leaves safe characters unchanged', () => {
    expect(escapeHtmlAttr('https://eushop.eu/callback?x=1')).toBe('https://eushop.eu/callback?x=1');
  });
});
