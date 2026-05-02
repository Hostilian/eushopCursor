import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';

export default function MessagesScreen() {
  const { data, isLoading, error } = trpc.messaging.list.useQuery(undefined, { retry: false });

  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
    >
      <Text className="text-ash text-xs tracking-widest uppercase">Inbox</Text>
      <Text className="text-ink mt-3 font-serif text-4xl">Messages.</Text>

      {isLoading ? (
        <Text className="text-ash mt-12">Loading…</Text>
      ) : error || !data?.length ? (
        <View className="border-ink/10 bg-porcelain mt-12 items-center rounded-3xl border p-12">
          <Ionicons name="mail-open-outline" size={32} color="#9A9081" />
          <Text className="text-ink mt-3 font-serif text-lg">Nothing here yet</Text>
          <Text className="text-ash mt-1 text-center text-sm">
            Find a listing you like and start a chat.
          </Text>
        </View>
      ) : (
        <View className="mt-8" style={{ gap: 8 }}>
          {data.map((c) => (
            <View key={c.id} className="border-ink/10 bg-porcelain rounded-2xl border p-5">
              <Text className="text-ink font-serif text-base">
                Conversation #{c.id.slice(0, 8)}
              </Text>
              <Text className="text-ash mt-1 text-xs">
                Last activity {new Date(c.lastMessageAt).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
