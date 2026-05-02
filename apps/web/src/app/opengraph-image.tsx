import { ImageResponse } from 'next/og';

export const alt = 'Eushop — Find a taste of home';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: 'linear-gradient(145deg, #1a1612 0%, #3b2f22 45%, #1a1612 100%)',
        color: '#faf7f2',
        fontFamily: 'Georgia, serif',
      }}
    >
      <div
        style={{ fontSize: 28, letterSpacing: '0.35em', textTransform: 'uppercase', opacity: 0.75 }}
      >
        EU · peer marketplace
      </div>
      <div>
        <div style={{ fontSize: 84, lineHeight: 1.05, fontWeight: 500, maxWidth: 900 }}>Eushop</div>
        <div style={{ marginTop: 24, fontSize: 36, opacity: 0.88, maxWidth: 820 }}>
          Find a taste of home, just down the street.
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 22, opacity: 0.7 }}>eushop.eu</div>
        <div
          style={{
            background: '#c97700',
            color: '#1a1612',
            padding: '12px 28px',
            borderRadius: 999,
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          Open beta
        </div>
      </div>
    </div>,
    { ...size },
  );
}
