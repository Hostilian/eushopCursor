import { Footer } from '../../components/layout/footer';
import { Nav } from '../../components/layout/nav';
import { ProfilePanel } from '../../components/profile/profile-panel';

export default function ProfilePage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-12 pb-32">
        <p className="text-ash text-xs tracking-widest uppercase">You</p>
        <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">Profile.</h1>
        <ProfilePanel />
      </main>
      <Footer />
    </>
  );
}
