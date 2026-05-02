import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';
import { SignInForm } from '../../components/auth/sign-in-form';

export default function SignInPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-16 pb-32">
        <div className="mx-auto grid max-w-5xl gap-12 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-ash">Welcome back</p>
            <h1 className="mt-3 font-serif text-5xl text-ink md:text-6xl">Sign in.</h1>
            <p className="mt-4 max-w-md text-lg text-ink/70">
              Magic link only — no passwords to forget. We email you a one-time link.
            </p>
            <ul className="mt-10 space-y-3 text-sm text-ink/70">
              <li>· Your email is yours; we never sell it.</li>
              <li>· You can sign in on web or mobile interchangeably.</li>
              <li>· Hosted entirely inside the EU.</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-ink/10 bg-porcelain p-10">
            <SignInForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
