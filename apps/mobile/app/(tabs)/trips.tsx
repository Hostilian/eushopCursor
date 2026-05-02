import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
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
          className="bg-ink rounded-full px-4 py-2.5"
          onPress={() => router.push('/trip/new')}
        >
          <Text className="text-paper text-sm font-medium">Post</Text>
        </TouchableOpacity>
      </View>

      {rows.length === 0 ? (
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
