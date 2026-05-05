/**
 * App Store + Play Store badges for the marketing footer.
 *
 * Renders inline SVGs (no third-party network round-trips, no badge-CDN
 * tracking pixel) styled to Apple's "Available on the App Store" and
 * Google's "Get it on Google Play" guidelines for monochrome usage:
 *
 * - Apple: keep aspect ratio, leave at least 1/8 of badge height clear
 *   space. https://developer.apple.com/app-store/marketing/guidelines/
 * - Google: minimum 60 dp height. Don't recolor inside.
 *   https://play.google.com/intl/en_us/badges/
 *
 * Both links are gated on env vars: badges only render once the App Store
 * record (`NEXT_PUBLIC_APP_STORE_URL`) and Play listing
 * (`NEXT_PUBLIC_PLAY_STORE_URL`) exist. Until then the component returns
 * null so we never link to a 404.
 */
export function StoreBadges() {
  const appStoreUrl = process.env.NEXT_PUBLIC_APP_STORE_URL?.trim();
  const playStoreUrl = process.env.NEXT_PUBLIC_PLAY_STORE_URL?.trim();
  if (!appStoreUrl && !playStoreUrl) return null;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {appStoreUrl ? (
        <a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Download Eushop on the App Store"
          className="inline-block transition-opacity hover:opacity-80"
        >
          <AppStoreBadge />
        </a>
      ) : null}
      {playStoreUrl ? (
        <a
          href={playStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Get Eushop on Google Play"
          className="inline-block transition-opacity hover:opacity-80"
        >
          <PlayStoreBadge />
        </a>
      ) : null}
    </div>
  );
}

function AppStoreBadge() {
  return (
    <svg
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 180 60"
      width="160"
      height="54"
      aria-hidden="true"
    >
      <rect width="180" height="60" rx="10" fill="#1A1612" />
      <g transform="translate(16 14)" fill="#FAF7F2">
        <path d="M16.6 0c.2 1.3-.3 2.5-1 3.4-.8 1-2 1.8-3.2 1.7-.2-1.2.4-2.5 1.1-3.4.7-.9 2-1.6 3.1-1.7zM21 11c-2.4-1.4-5.5-1-7.6 0-1.5.7-3 1-4.3.5-2-.7-3.6-2.7-3.6-5.5 0-2.7 1.5-5.6 4.4-5.7 1.4-.1 2.8.6 3.7.6.9 0 2.7-.7 4.5-.6 1.6 0 3.6.7 4.7 2.4-.1 0-2.8 1.6-2.8 4.9 0 3.7 3.2 5 3.3 5-.1.1-.5 1.7-1.7 3.4-.9 1.3-1.9 2.6-3.4 2.6-1.4 0-1.9-.8-3.5-.8-1.6 0-2.1.8-3.4.8-1.5 0-2.7-1.4-3.6-2.6 1-.1 3.5-2 5.6-4.6 1.4-1.7 2.6-3.5 2.6-3.5.1.1 1 .7 2.6.7 1.6 0 2.4-.5 2.4-.5z" />
      </g>
      <g
        transform="translate(58 22)"
        fill="#FAF7F2"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        <text fontSize="8" letterSpacing="0.5" opacity="0.85">
          Download on the
        </text>
        <text y="18" fontSize="18" fontWeight="600" letterSpacing="-0.5">
          App Store
        </text>
      </g>
    </svg>
  );
}

function PlayStoreBadge() {
  return (
    <svg
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 180 60"
      width="160"
      height="54"
      aria-hidden="true"
    >
      <rect width="180" height="60" rx="10" fill="#1A1612" />
      <g transform="translate(16 12)">
        <path d="M0 0 L18 18 L0 36 Z" fill="#B8860B" opacity="0.85" />
        <path d="M2 0 L26 14 L18 18 Z" fill="#B8860B" />
        <path d="M2 36 L26 22 L18 18 Z" fill="#B8860B" opacity="0.6" />
      </g>
      <g
        transform="translate(58 22)"
        fill="#FAF7F2"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
      >
        <text fontSize="8" letterSpacing="0.5" opacity="0.85">
          GET IT ON
        </text>
        <text y="18" fontSize="18" fontWeight="600" letterSpacing="-0.5">
          Google Play
        </text>
      </g>
    </svg>
  );
}
