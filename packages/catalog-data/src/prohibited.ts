/**
 * Server-side policy hints for peer exchange copy. Not legal advice — operators
 * still moderate; this blocks obviously disallowed categories from automated posting.
 */
const PHRASES: readonly string[] = [
  'live animal',
  'human trafficking',
  'child porn',
  'counterfeit currency',
  'money laundering',
  'unlicensed pharmaceutical wholesale',
  'fentanyl',
  'cocaine',
  'heroin',
  'methamphetamine',
  'weapon grade',
  'explosives grade',
  'radioactive material',
];

/**
 * Returns a normalized reason code if `combinedUserText` matches a blocked phrase.
 */
export function findProhibitedOpenAskMatch(combinedUserText: string): string | null {
  const lower = combinedUserText.toLowerCase();
  for (const phrase of PHRASES) {
    if (lower.includes(phrase)) return phrase;
  }
  return null;
}
