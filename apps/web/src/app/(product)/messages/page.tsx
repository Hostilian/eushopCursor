import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { ConversationsList } from '../../../components/messaging/conversations-list';

export default function MessagesPage() {
  return (
    <>
      <Nav />
      <main className="container-editorial pt-12 pb-32">
        <p className="text-ash text-xs tracking-widest uppercase">Inbox</p>
        <h1 className="text-ink mt-3 font-serif text-5xl md:text-6xl">Messages.</h1>
        <ConversationsList />
      </main>
      <Footer />
    </>
  );
}
