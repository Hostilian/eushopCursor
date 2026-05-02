import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { NotificationsPanel } from '../../../components/notifications/notifications-panel';

export const metadata = {
  title: 'Notifications',
  description: 'In-app alerts for matches, trips, and messages.',
};

export default function NotificationsPage() {
  return (
    <>
      <Nav />
      <main id="main-content" className="container-editorial pt-12 pb-32">
        <p className="text-ash text-xs tracking-widest uppercase">Inbox</p>
        <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">Notifications.</h1>
        <p className="text-ink/70 mt-3 max-w-xl text-lg">
          Trip matches, listing matches, and messages — mark items read when you have handled them.
        </p>
        <NotificationsPanel />
      </main>
      <Footer />
    </>
  );
}
