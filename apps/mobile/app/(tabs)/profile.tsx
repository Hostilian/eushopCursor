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
          platform: (Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web') as
            | 'ios'
            | 'android'
            | 'web',
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
      <View className="flex-1 items-center justify-center bg-paper">
        <Text className="text-ash">Loading…</Text>
      </View>
    );
  }
  if (!me.data) {
    return (
      <View className="flex-1 items-center justify-center bg-paper p-10">
        <Ionicons name="person-circle-outline" size={56} color="#9A9081" />
        <Text className="mt-3 font-serif text-2xl text-ink">Sign in</Text>
        <Text className="mt-1 text-center text-sm text-ash">
          We email you a magic link — no passwords ever.
        </Text>
        <TouchableOpacity
          className="mt-6 rounded-full bg-ink px-6 py-3"
          onPress={() => router.push('/sign-in')}
        >
          <Text className="text-paper font-medium">Sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 24, paddingBottom: 64 }}>
      <Text className="text-xs uppercase tracking-widest text-ash">You</Text>
      <Text className="mt-3 font-serif text-4xl text-ink">{me.data.profile?.displayName ?? me.data.user.email}</Text>
      <Text className="mt-2 text-sm text-ash">{me.data.user.email}</Text>

      <View className="mt-8 rounded-3xl border border-ink/10 bg-porcelain p-6">
        <Text className="text-xs uppercase tracking-widest text-ash">Trust</Text>
        <Text className="mt-2 font-serif text-2xl text-ink">
          {me.data.profile?.successfulExchanges ?? 0} exchanges
        </Text>
      </View>

      <View className="mt-4 rounded-3xl border border-ink/10 bg-porcelain p-6">
        <Text className="text-xs uppercase tracking-widest text-ash">Notifications</Text>
        <Text className="mt-2 text-sm text-ink/80">Push status: {status}</Text>
      </View>

      <TouchableOpacity
        className="mt-8 self-start rounded-full border border-danger/40 px-5 py-2.5"
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
        <Text className="text-sm text-danger">Delete account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
