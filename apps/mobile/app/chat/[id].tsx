import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';

const SAFE_TEMPLATES = [
  'Hi! Is your stash still available?',
  'Could we meet near a metro stop you like?',
  'Happy with the fee — Revolut/cash?',
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const conv = trpc.messaging.conversation.useQuery({ id: id! }, { enabled: !!id, retry: false });
  const send = trpc.messaging.send.useMutation();
  const utils = trpc.useUtils();
  const [body, setBody] = useState('');
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (conv.data?.messages.length) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [conv.data?.messages.length]);

  const messages = conv.data?.messages ?? [];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-paper"
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View className="max-w-[80%] rounded-2xl bg-porcelain p-3">
            <Text className="text-sm text-ink">{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text className="mt-12 text-center text-ash">No messages yet — say hi.</Text>
        }
      />
      <View className="border-t border-ink/10 p-3" style={{ gap: 8 }}>
        <View className="flex-row" style={{ gap: 6 }}>
          {SAFE_TEMPLATES.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setBody(t)}
              className="rounded-full border border-ink/10 px-3 py-1.5"
            >
              <Text className="text-[10px] text-ink/70">{t.slice(0, 22)}…</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Type a message"
            placeholderTextColor="#9A9081"
            className="flex-1 rounded-full border border-ink/10 bg-porcelain px-4 py-3 text-ink"
          />
          <TouchableOpacity
            className="h-12 w-12 items-center justify-center rounded-full bg-ink"
            onPress={async () => {
              if (!body.trim() || !id) return;
              await send.mutateAsync({ conversationId: id, body });
              setBody('');
              await utils.messaging.conversation.invalidate({ id });
            }}
          >
            <Ionicons name="arrow-up" color="#FAF7F2" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
