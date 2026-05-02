import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';

const legalName =
  process.env.NEXT_PUBLIC_LEGAL_REGISTERED_NAME?.trim() ||
  '[e.g. Eushop Sàrl — configure NEXT_PUBLIC_LEGAL_REGISTERED_NAME]';
const legalOffice =
  process.env.NEXT_PUBLIC_LEGAL_REGISTERED_OFFICE?.trim() ||
  '[Full address — configure NEXT_PUBLIC_LEGAL_REGISTERED_OFFICE]';
const registerId =
  process.env.NEXT_PUBLIC_LEGAL_REGISTER_ID?.trim() ||
  '[RCS / trade register — configure NEXT_PUBLIC_LEGAL_REGISTER_ID]';
const vatId =
  process.env.NEXT_PUBLIC_LEGAL_VAT_ID?.trim() ||
  '[VAT ID if applicable — configure NEXT_PUBLIC_LEGAL_VAT_ID]';
const supervisory =
  process.env.NEXT_PUBLIC_LEGAL_SUPERVISORY_NOTE?.trim() ||
  '[If your sector requires a named regulator, list it here after legal review.]';

/**
 * Imprint (Impressum). Values default to bracketed hints for local dev; production
 * must set the NEXT_PUBLIC_LEGAL_* variables to counsel-approved text.
 */
export default function ImprintPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <p className="text-ash text-xs tracking-widest uppercase">Impressum / Imprint</p>
        <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">Legal disclosure</h1>
        <article className="prose prose-stone text-ink/80 mt-12 max-w-xl leading-relaxed">
          <h2 className="text-ink font-serif text-2xl">Service operator</h2>
          <p>
            <strong className="text-ink">Trade name:</strong> Eushop
          </p>
          <p>
            <strong className="text-ink">Legal form &amp; registered name:</strong> {legalName}
          </p>
          <p>
            <strong className="text-ink">Registered office:</strong> {legalOffice}
          </p>
          <p>
            <strong className="text-ink">Register / file number:</strong> {registerId}
          </p>
          <p>
            <strong className="text-ink">VAT ID:</strong> {vatId}
          </p>

          <h2 className="text-ink mt-10 font-serif text-2xl">Contact</h2>
          <p>
            General:{' '}
            <a href="mailto:hello@eushop.eu" className="text-ink underline">
              hello@eushop.eu
            </a>
          </p>
          <p>
            Data protection:{' '}
            <a href="mailto:dpo@eushop.eu" className="text-ink underline">
              dpo@eushop.eu
            </a>
          </p>

          <h2 className="text-ink mt-10 font-serif text-2xl">
            Regulatory information (Germany §5 TMG / Luxembourg disclosure law)
          </h2>
          <p>
            The party responsible for editorial content within the meaning of §55(2) RStV /
            applicable Luxembourg rules is the legal entity named above, reachable at the address on
            file with the trade register.
          </p>
          <p>
            <strong className="text-ink">Supervisory authority:</strong> {supervisory}
          </p>
          <p>
            <strong className="text-ink">Dispute resolution:</strong> The European Commission
            provides a platform for online dispute resolution (ODR):{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              className="text-ink underline"
              rel="noopener noreferrer"
            >
              https://ec.europa.eu/consumers/odr/
            </a>
            . We are not obliged or willing to participate in dispute resolution before a consumer
            arbitration board unless required by law.
          </p>

          <h2 className="text-ink mt-10 font-serif text-2xl">Liability for content and links</h2>
          <p>
            We make reasonable efforts to keep information accurate but assume no liability for
            third-party content or for the accuracy of user-generated marketplace listings. External
            links are provided for convenience; we do not control linked sites.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
