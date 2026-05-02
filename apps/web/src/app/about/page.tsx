import { EditorialPageLayout } from '../../components/marketing/editorial-page';

export default function AboutPage() {
  return (
    <EditorialPageLayout
      eyebrow="About"
      title="The neighbour with the suitcase, found."
      subtitle="Sixteen million EU citizens live outside their birth country. Eushop exists for the small cravings in between visits home."
    >
      <article className="text-ink/80 max-w-2xl space-y-6 text-lg leading-relaxed text-pretty">
        <p>
          Sixteen million EU citizens live in a member state other than the one they were born in.
          Almost all of them carry the same small ache: the chocolate that doesn&apos;t taste quite
          right anywhere else, the curd-cheese bar from grandma&apos;s fridge, the precise brand of
          sausage that means &quot;Sunday&quot; to them.
        </p>
        <p>
          Eushop exists to scratch that itch. Not by importing, packaging, shipping. By making the
          introduction. Someone in your city brought back a tin of Wedel, a wheel of Manchego, a
          tube of Aromat. We just put you in touch.
        </p>
        <p>
          We are tiny on purpose. No payments. No commercial sellers. No bulk imports. Just
          neighbours, finder&apos;s fees, and a coffee-shop handoff.
        </p>
      </article>
    </EditorialPageLayout>
  );
}
