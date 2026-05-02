import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';

export default function ProfileScreen() {
  const router = useRouter();
  const me = trpc.profile.me.useQuery(undefined, { retry: false });
  const registerDevice = trpc.notifications.registerDevice.useMutation();
  const [status, setStatus] = useState<string>('idle');

  useEffect(() => {
    if (!me.data) return;
    void (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      try {
        const tokenResult = await Notifications.getExpoPushTokenAsync();
        await registerDevice.mutateAsync({
          platform: (Platform.OS === 'ios'
            ? 'ios'
            : Platform.OS === 'android'
              ? 'android'
              : 'web') as 'ios' | 'android' | 'web',
          expoPushToken: tokenResult.data,
        });
        setStatus('registered');
      } catch (e) {
        setStatus(e instanceof Error ? e.message : 'failed');
      }
    })();
  }, [me.data]);

  if (me.isLoading) {
    return (
      <View className="bg-paper flex-1 items-center justify-center">
        <Text className="text-ash">Loading…</Text>
      </View>
    );
  }
  if (!me.data) {
    return (
      <View className="bg-paper flex-1 items-center justify-center p-10">
        <Ionicons name="person-circle-outline" size={56} color="#9A9081" />
        <Text className="text-ink mt-3 font-serif text-2xl">Sign in</Text>
        <Text className="text-ash mt-1 text-center text-sm">
          We email you a magic link — no passwords ever.
        </Text>
        <TouchableOpacity
          className="bg-ink mt-6 rounded-full px-6 py-3"
          onPress={() => router.push('/sign-in')}
        >
          <Text className="text-paper font-medium">Sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
    >
      <Text className="text-ash text-xs tracking-widest uppercase">You</Text>
      <Text className="text-ink mt-3 font-serif text-4xl">
        {me.data.profile?.displayName ?? me.data.user.email}
      </Text>
      <Text className="text-ash mt-2 text-sm">{me.data.user.email}</Text>

      <View className="border-ink/10 bg-porcelain mt-8 rounded-3xl border p-6">
        <Text className="text-ash text-xs tracking-widest uppercase">Trust</Text>
        <Text className="text-ink mt-2 font-serif text-2xl">
          {me.data.profile?.successfulExchanges ?? 0} exchanges
        </Text>
      </View>

      <View className="border-ink/10 bg-porcelain mt-4 rounded-3xl border p-6">
        <Text className="text-ash text-xs tracking-widest uppercase">Notifications</Text>
        <Text className="text-ink/80 mt-2 text-sm">Push status: {status}</Text>
      </View>

      <TouchableOpacity
        className="border-danger/40 mt-8 self-start rounded-full border px-5 py-2.5"
        onPress={() =>
          Alert.alert('Delete account', 'This permanently removes your data.', [
            { text: 'Cancel' },
            {
              text: 'Delete',
              style: 'destructive',
              onPress: () => {
                /* hooked up to trpc.profile.deleteMyAccount in production */
              },
            },
          ])
        }
      >
        <Text className="text-danger text-sm">Delete account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
