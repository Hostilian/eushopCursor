import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';

export default function MessagesScreen() {
  const { data, isLoading, error } = trpc.messaging.list.useQuery(undefined, { retry: false });

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 24, paddingBottom: 64 }}>
      <Text className="text-xs uppercase tracking-widest text-ash">Inbox</Text>
      <Text className="mt-3 font-serif text-4xl text-ink">Messages.</Text>

      {isLoading ? (
        <Text className="mt-12 text-ash">Loading…</Text>
      ) : error || !data?.length ? (
        <View className="mt-12 items-center rounded-3xl border border-ink/10 bg-porcelain p-12">
          <Ionicons name="mail-open-outline" size={32} color="#9A9081" />
          <Text className="mt-3 font-serif text-lg text-ink">Nothing here yet</Text>
          <Text className="mt-1 text-center text-sm text-ash">
            Find a listing you like and start a chat.
          </Text>
        </View>
      ) : (
        <View className="mt-8" style={{ gap: 8 }}>
          {data.map((c) => (
            <View key={c.id} className="rounded-2xl border border-ink/10 bg-porcelain p-5">
              <Text className="font-serif text-base text-ink">Conversation #{c.id.slice(0, 8)}</Text>
              <Text className="mt-1 text-xs text-ash">
                Last activity {new Date(c.lastMessageAt).toLocaleString()}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
