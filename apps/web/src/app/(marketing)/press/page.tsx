import { EditorialPageLayout } from '../../components/marketing/editorial-page';

const pressEmail = process.env.NEXT_PUBLIC_PRESS_EMAIL?.trim() || 'press@eushop.eu';

export default function PressPage() {
  return (
    <EditorialPageLayout
      eyebrow="Press"
      title="Boilerplate & marks"
      subtitle={`Short copy you can lift for articles and decks. Media contact: ${pressEmail}.`}
    >
      <div className="text-ink/80 max-w-2xl space-y-8 text-lg leading-relaxed">
        <p>
          <strong className="text-ink">Contact:</strong>{' '}
          <a href={`mailto:${pressEmail}`} className="text-ink underline">
            {pressEmail}
          </a>
          . Request a logo pack (SVG/PNG) and product screenshots via this address.
        </p>
        <p>
          <strong className="text-ink">Boilerplate:</strong> Eushop is a city- and route-first peer
          marketplace for spare luggage space on real journeys, open asks, and finder-fee local
          shares when someone wants something specific. Discovery is place-based; settlement and
          logistics stay between the parties unless regulated in-app payments are offered later.
        </p>
        <p>
          <strong className="text-ink">Logo:</strong> Use the wordmark &quot;Eushop&quot; in
          Fraunces where available; fallback to Georgia. Primary colours: paper #FAF7F2, ink
          #1A1612, saffron accent #C97700.
        </p>
        <p>
          <strong className="text-ink">Screenshots:</strong> Run{' '}
          <code className="bg-ink/5 text-ink rounded px-1.5 py-0.5 text-sm">pnpm dev</code> for the
          full stack, or{' '}
          <code className="bg-ink/5 text-ink rounded px-1.5 py-0.5 text-sm">
            pnpm --filter @eushop/admin dev
          </code>{' '}
          for the operator console.
        </p>
      </div>
    </EditorialPageLayout>
  );
}
