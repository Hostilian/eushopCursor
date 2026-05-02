import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-xs uppercase tracking-widest text-ash">About</p>
        <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl text-balance">
          The neighbour with the suitcase, found.
        </h1>
        <article className="mt-12 max-w-2xl space-y-6 text-pretty text-lg text-ink/80 leading-relaxed">
          <p>
            Sixteen million EU citizens live in a member state other than the one they were born
            in. Almost all of them carry the same small ache: the chocolate that doesn't taste
            quite right anywhere else, the curd-cheese bar from grandma's fridge, the precise
            brand of sausage that means "Sunday" to them.
          </p>
          <p>
            Eushop exists to scratch that itch. Not by importing, packaging, shipping. By making
            the introduction. Someone in your city brought back a tin of Wedel, a wheel of
            Manchego, a tube of Aromat. We just put you in touch.
          </p>
          <p>
            We are tiny on purpose. No payments. No commercial sellers. No bulk imports. Just
            neighbours, finder's fees, and a coffee-shop handoff.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
