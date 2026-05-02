import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';

export default function DataExportPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">GDPR · Art. 15 / 17 / 20</p>
        <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl">Your data, your call.</h1>
        <article className="mt-12 max-w-2xl space-y-6 text-ink/80 leading-relaxed">
          <p>
            From your profile, you can:
          </p>
          <ul className="ml-5 list-disc space-y-2">
            <li><strong>Export</strong> a JSON file of everything we hold about you (Art. 15 + 20).</li>
            <li><strong>Delete</strong> your account permanently (Art. 17). This wipes your listings, requests, chats, reviews and device tokens.</li>
            <li><strong>Object</strong> to optional analytics from the consent banner (Art. 21).</li>
          </ul>
          <p>
            Need a manual review or a special request? Email <a className="underline" href="mailto:dpo@eushop.eu">dpo@eushop.eu</a> and we'll respond within 30 days.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
