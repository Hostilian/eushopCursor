import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';

export default function ImprintPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">Impressum / Imprint</p>
        <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl">Eushop legal entity.</h1>
        <article className="prose prose-stone mt-12 max-w-xl text-ink/80 leading-relaxed">
          <p>Operator: Eushop Sàrl (placeholder until incorporation)</p>
          <p>Registered seat: Luxembourg / EU</p>
          <p>Email: hello@eushop.eu</p>
          <p>Data Protection Officer: dpo@eushop.eu</p>
          <p className="mt-8">
            Disclosure under §5 TMG (Germany) / Loi du 14 août 2000 (Luxembourg) — to be completed
            once the entity is registered.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
