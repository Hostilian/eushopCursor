import { MESSAGING_SAFE_TEMPLATES as SAFE_TEMPLATES } from '@eushop/validators';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { trpc } from '../../src/lib/trpc';

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const me = trpc.profile.me.useQuery(undefined, { retry: false });
  const conv = trpc.messaging.conversation.useQuery({ id: id! }, { enabled: !!id, retry: false });
  const send = trpc.messaging.send.useMutation();
  const utils = trpc.useUtils();
  const [body, setBody] = useState('');
  const listRef = useRef<FlatList>(null);

  const myId = me.data?.user.id;
  const c = conv.data?.conversation;
  const peerId = myId && c ? (c.initiatorId === myId ? c.recipientId : c.initiatorId) : undefined;

  const blockStatus = trpc.profile.blockStatus.useQuery(
    { userId: peerId! },
    { enabled: Boolean(peerId && myId), retry: false },
  );
  const blockUser = trpc.profile.blockUser.useMutation({
    onSuccess: async () => {
      await utils.profile.blockStatus.invalidate({ userId: peerId! });
      await utils.messaging.list.invalidate();
    },
  });
  const unblockUser = trpc.profile.unblockUser.useMutation({
    onSuccess: async () => {
      await utils.profile.blockStatus.invalidate({ userId: peerId! });
      await utils.messaging.list.invalidate();
    },
  });

  useEffect(() => {
    if (conv.data?.messages.length) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    }
  }, [conv.data?.messages.length]);

  const messages = conv.data?.messages ?? [];
  const blocked = blockStatus.data?.blocked;
  const iBlocked = blockStatus.data?.iBlockedThem;
  const theyBlocked = blockStatus.data?.theyBlockedMe;
  const canSend = !blocked;

  if (conv.error?.data?.code === 'FORBIDDEN') {
    return (
      <View className="bg-paper flex-1 items-center justify-center px-6">
        <Text className="text-ink text-center font-serif text-xl">This chat is not available</Text>
        <Text className="text-ash mt-2 text-center text-sm">
          Messaging may be limited when someone has blocked the other party.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="bg-paper"
    >
      {peerId ? (
        <View className="border-ink/10 flex-row items-center justify-end border-b px-4 py-2">
          {theyBlocked ? (
            <Text className="text-oxide text-xs">You cannot reply here</Text>
          ) : iBlocked ? (
            <TouchableOpacity
              onPress={() => unblockUser.mutate({ userId: peerId })}
              disabled={unblockUser.isPending}
              className="border-ink/15 rounded-full border px-3 py-1.5"
            >
              <Text className="text-ink text-xs">Unblock</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                Alert.alert('Block this user?', 'You will not be able to message each other.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Block',
                    style: 'destructive',
                    onPress: () => blockUser.mutate({ userId: peerId }),
                  },
                ]);
              }}
              disabled={blockUser.isPending}
              className="border-oxide/30 rounded-full border px-3 py-1.5"
            >
              <Text className="text-oxide text-xs">Block</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}
      {theyBlocked ? (
        <Text className="border-oxide/20 bg-oxide/5 text-ink border-b px-4 py-2 text-xs">
          This person has blocked you.
        </Text>
      ) : null}
      {iBlocked ? (
        <Text className="border-ink/10 bg-ink/5 text-ink border-b px-4 py-2 text-xs">
          You blocked this person — unblock to message again.
        </Text>
      ) : null}

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, gap: 8 }}
        renderItem={({ item }) => (
          <View className="bg-porcelain max-w-[80%] rounded-2xl p-3">
            <Text className="text-ink text-sm">{item.body}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text className="text-ash mt-12 text-center">No messages yet — say hi.</Text>
        }
      />
      <View className="border-ink/10 border-t p-3" style={{ gap: 8 }}>
        <View className="flex-row" style={{ gap: 6 }}>
          {SAFE_TEMPLATES.map((t) => (
            <TouchableOpacity
              key={t}
              disabled={!canSend}
              onPress={() => setBody(t)}
              className="border-ink/10 rounded-full border px-3 py-1.5"
            >
              <Text className="text-ink/70 text-[10px]">{t.slice(0, 22)}…</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <TextInput
            value={body}
            onChangeText={setBody}
            editable={canSend}
            placeholder={canSend ? 'Type a message' : 'Unavailable'}
            placeholderTextColor="#9A9081"
            className="border-ink/10 bg-porcelain text-ink flex-1 rounded-full border px-4 py-3"
          />
          <TouchableOpacity
            className="bg-ink h-12 w-12 items-center justify-center rounded-full"
            disabled={!canSend}
            onPress={async () => {
              if (!canSend || !body.trim() || !id) return;
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
