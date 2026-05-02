import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { trpc } from '../../src/lib/trpc';

const ISO_FLAGS: Record<string, string> = {
  PL: '🇵🇱',
  DE: '🇩🇪',
  FR: '🇫🇷',
  IT: '🇮🇹',
  ES: '🇪🇸',
  PT: '🇵🇹',
  NL: '🇳🇱',
  BE: '🇧🇪',
  AT: '🇦🇹',
  CZ: '🇨🇿',
  GR: '🇬🇷',
  HU: '🇭🇺',
  IE: '🇮🇪',
  SE: '🇸🇪',
  FI: '🇫🇮',
  EE: '🇪🇪',
  HR: '🇭🇷',
  SI: '🇸🇮',
  RO: '🇷🇴',
  BG: '🇧🇬',
  LV: '🇱🇻',
  LT: '🇱🇹',
  SK: '🇸🇰',
  LU: '🇱🇺',
  MT: '🇲🇹',
  CY: '🇨🇾',
  DK: '🇩🇰',
};

export default function TripsScreen() {
  const router = useRouter();
  const trips = trpc.trips.recent.useQuery({ limit: 24 }, { retry: false });
  const rows = trips.data ?? [];

  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
      refreshControl={
        <RefreshControl
          refreshing={trips.isFetching && !trips.isLoading}
          onRefresh={() => {
            void trips.refetch();
          }}
        />
      }
    >
      <View className="flex-row items-end justify-between">
        <View className="flex-1">
          <Text className="text-ash text-xs tracking-widest uppercase">Suitcase capacity</Text>
          <Text className="text-ink mt-3 font-serif text-4xl">Upcoming trips.</Text>
          <Text className="text-ash mt-2 text-sm">
            Diaspora travellers selling spare slots in their next trip home.
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Post a new trip"
          className="bg-ink rounded-full px-4 py-2.5"
          onPress={() => router.push('/trip/new')}
        >
          <Text className="text-paper text-sm font-medium">Post</Text>
        </TouchableOpacity>
      </View>

      {trips.isLoading ? (
        <View className="mt-12 items-center">
          <ActivityIndicator />
          <Text className="text-ash mt-3 text-xs">Loading trips…</Text>
        </View>
      ) : trips.isError ? (
        <View className="border-danger/30 bg-danger/5 mt-12 rounded-2xl border p-6">
          <Text className="text-danger text-sm">
            Could not load trips: {trips.error?.message ?? 'unknown error'}.
          </Text>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Retry loading trips"
            onPress={() => {
              void trips.refetch();
            }}
            className="bg-ink mt-4 self-start rounded-full px-4 py-2"
          >
            <Text className="text-paper text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : rows.length === 0 ? (
        <View className="mt-12 items-center">
          <Ionicons name="airplane-outline" size={40} color="#9A9081" />
          <Text className="text-ash mt-3 text-center text-sm">
            No trips posted yet. Be the first traveller to advertise spare slots from your next trip
            home.
          </Text>
        </View>
      ) : (
        <View className="mt-8" style={{ gap: 12 }}>
          {rows.map((t) => (
            <TouchableOpacity
              key={t.id}
              accessibilityRole="button"
              accessibilityLabel={`Open trip ${t.originCity} to ${t.destinationCity}`}
              activeOpacity={0.9}
              onPress={() => router.push(`/trip/${t.id}`)}
              className="border-ink/10 bg-porcelain rounded-3xl border p-5"
            >
              <View className="flex-row items-center" style={{ gap: 8 }}>
                <Text className="text-ink font-serif text-xl">
                  {ISO_FLAGS[t.originCountryIso2] ?? '🇪🇺'} {t.originCity}
                </Text>
                <Ionicons name="airplane" size={16} color="#C97700" />
                <Text className="text-ink font-serif text-xl">
                  {ISO_FLAGS[t.destinationCountryIso2] ?? '🇪🇺'} {t.destinationCity}
                </Text>
              </View>
              <Text className="text-ash mt-2 text-xs">
                Departs {new Date(t.departAt).toLocaleDateString()} · {t.slotsAvailable}/
                {t.slotsTotal} slots · €{Number(t.defaultPerSlotFee).toFixed(2)} per slot
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
