import { Footer } from '../layout/footer';
import { Nav } from '../layout/nav';

export function EditorialPageLayout({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-16 pb-32">
        <p className="text-ash text-xs tracking-widest uppercase">{eyebrow}</p>
        <h1 className="text-ink mt-3 font-serif text-5xl text-balance md:text-6xl">{title}</h1>
        {subtitle ? <p className="text-ink/70 mt-4 max-w-xl text-lg">{subtitle}</p> : null}
        <div className="mt-12">{children}</div>
      </main>
      <Footer />
    </>
  );
}
