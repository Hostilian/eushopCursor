import { EditorialPageLayout } from '../../../components/marketing/editorial-page';
import { MarketingSourcesStrip } from '../../../components/marketing/marketing-sources-strip';

export default function AboutPage() {
  return (
    <EditorialPageLayout
      eyebrow="About"
      title="The taste of home, without the mystery DMs."
      subtitle="People are always on the move, and they bring things back for each other. Eushop is the open layer for that, anywhere in the world. We are starting in dense European corridors, where the diaspora flows are best documented, and growing out from there."
    >
      <article className="text-ink/80 max-w-2xl space-y-6 text-lg leading-relaxed text-pretty">
        <p>
          Eushop exists for the small cravings between visits home: the chocolate that doesn&apos;t
          taste quite right anywhere else, the cheese bar from grandma&apos;s fridge, the brand of
          sausage that means &quot;Sunday&quot; to you.
        </p>
        <p>
          We are not an importer, a warehouse, or a courier. We are introductions: spare luggage
          space on real routes, open asks, and local shares between neighbours—discovery, identity
          you can see, and chat that leads to a clear handoff. Settlement stays between you until
          regulated in-app payments exist.
        </p>
        <p>
          We are tiny on purpose. No commercial sellers in the loop today. Meet in public, use your
          judgement, and keep portions neighbour-sized.
        </p>
      </article>
      <MarketingSourcesStrip />
    </EditorialPageLayout>
  );
}
