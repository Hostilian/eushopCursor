import { EditorialPageLayout } from '../../components/marketing/editorial-page';

export default function PressPage() {
  return (
    <EditorialPageLayout
      eyebrow="Press"
      title="Boilerplate & marks"
      subtitle="Short copy you can lift for articles and decks. Contact: press@eushop.eu (placeholder)."
    >
      <div className="text-ink/80 max-w-2xl space-y-8 text-lg leading-relaxed">
        <p>
          <strong className="text-ink">Boilerplate:</strong> Eushop is a pan-European discovery and
          messaging service that helps people find niche regional foods from neighbours nearby. The
          platform never handles payments or logistics; users agree finder&apos;s fees and meet in
          public.
        </p>
        <p>
          <strong className="text-ink">Logo:</strong> Use the wordmark &quot;Eushop&quot; in
          Fraunces where available; fallback to Georgia. Primary colours: paper #FAF7F2, ink
          #1A1612, saffron accent #C97700.
        </p>
        <p>
          <strong className="text-ink">Screenshots:</strong> Run{' '}
          <code className="text-ink bg-ink/5 rounded px-1.5 py-0.5 text-sm">pnpm demo</code> for web
          + API, or{' '}
          <code className="text-ink bg-ink/5 rounded px-1.5 py-0.5 text-sm">
            pnpm --filter @eushop/admin dev
          </code>{' '}
          for the operator console.
        </p>
      </div>
    </EditorialPageLayout>
  );
}
