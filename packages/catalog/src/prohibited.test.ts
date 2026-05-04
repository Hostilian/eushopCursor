import { describe, expect, it } from 'vitest';
import { findProhibitedOpenAskMatch } from './prohibited';

describe('findProhibitedOpenAskMatch', () => {
  it('returns null for normal food copy', () => {
    expect(findProhibitedOpenAskMatch('Looking for Krówki from Warsaw')).toBeNull();
  });

  it('flags blocked phrases case-insensitively', () => {
    expect(findProhibitedOpenAskMatch('Need help moving LIVE ANIMAL')).toBe('live animal');
    expect(findProhibitedOpenAskMatch('fentanyl pills')).toBe('fentanyl');
  });
});
