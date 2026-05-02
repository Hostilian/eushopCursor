import { Footer } from '../../../components/layout/footer';
import { Nav } from '../../../components/layout/nav';
import { ChatView } from '../../../components/messaging/chat-view';

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <Nav />
      <main className="container-editorial pt-12 pb-32">
        <ChatView conversationId={id} />
      </main>
      <Footer />
    </>
  );
}
