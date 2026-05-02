import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';

export default function RequestsScreen() {
  const router = useRouter();
  const feed = trpc.requests.feed.useQuery({ limit: 24 }, { retry: false });
  const rows = feed.data ?? [];

  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
    >
      <View className="flex-row items-end justify-between">
        <View className="flex-1">
          <Text className="text-ash text-xs tracking-widest uppercase">Wanted</Text>
          <Text className="text-ink mt-3 font-serif text-4xl">Open requests.</Text>
        </View>
        <TouchableOpacity
          className="bg-ink rounded-full px-4 py-2.5"
          onPress={() => router.push('/request/new')}
        >
          <Text className="text-paper text-sm font-medium">New</Text>
        </TouchableOpacity>
      </View>

      {rows.length === 0 ? (
        <View className="mt-12 items-center">
          <Ionicons name="megaphone-outline" size={40} color="#9A9081" />
          <Text className="text-ash mt-3 text-center text-sm">
            No open requests yet. Post yours — we'll ping every diaspora traveller in your radius
            and surface it on the next matching trip from your country of origin.
          </Text>
        </View>
      ) : (
        <View className="mt-8" style={{ gap: 12 }}>
          {rows.map((r) => (
            <View key={r.id} className="border-ink/10 bg-porcelain rounded-3xl border p-5">
              <View className="flex-row items-start gap-4">
                <Text className="text-3xl">🇪🇺</Text>
                <View className="flex-1">
                  <Text className="text-ink font-serif text-xl">{r.freeformText}</Text>
                  <Text className="text-ash mt-1 text-sm">
                    {r.approximateCity} · within {r.radiusKm} km
                    {r.maxFinderFee ? ` · up to €${r.maxFinderFee}` : ''}
                  </Text>
                </View>
                <TouchableOpacity className="border-ink/15 rounded-full border px-4 py-2">
                  <Text className="text-ink/80 text-xs">I have this</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
