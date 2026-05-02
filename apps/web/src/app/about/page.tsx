import { EditorialPageLayout } from '../../components/marketing/editorial-page';
import { MarketingSourcesStrip } from '../../components/marketing/marketing-sources-strip';

export default function AboutPage() {
  return (
    <EditorialPageLayout
      eyebrow="About"
      title="The neighbour with the suitcase, found."
      subtitle="Cross-border mobility inside Europe has run at very large scale for decades—official statistics from the 1990s and 2000s documented millions on the move long before this app existed."
    >
      <article className="text-ink/80 max-w-2xl space-y-6 text-lg leading-relaxed text-pretty">
        <p>
          Eushop exists for the small cravings between visits home: the chocolate that doesn&apos;t
          taste quite right anywhere else, the cheese bar from grandma&apos;s fridge, the brand of
          sausage that means &quot;Sunday&quot; to you.
        </p>
        <p>
          We are not an importer, a warehouse, or a courier. We are introductions: trip offers with
          reservable suitcase slots, open requests, and nearby pantry listings—discovery, identity
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
