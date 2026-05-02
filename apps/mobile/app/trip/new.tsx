import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';

const SECONDS_DAY = 24 * 60 * 60;

export default function NewTripScreen() {
  const router = useRouter();
  const create = trpc.trips.create.useMutation();
  const [originIso, setOriginIso] = useState('PL');
  const [originCity, setOriginCity] = useState('');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [destIso, setDestIso] = useState('DE');
  const [destCity, setDestCity] = useState('');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [days, setDays] = useState('7');
  const [slots, setSlots] = useState('6');
  const [fee, setFee] = useState('5');
  const [pinning, setPinning] = useState<'origin' | 'dest' | null>(null);

  /**
   * Best-effort coarse country centroid so a missing pin still produces a
   * believable origin/destination point inside the right country. The router
   * snaps everything to the geohash cell anyway, so 5–50 km accuracy is fine.
   */
  function fallbackCentroid(iso: string): { lat: number; lng: number } {
    const map: Record<string, { lat: number; lng: number }> = {
      PL: { lat: 52.0, lng: 19.5 },
      DE: { lat: 51.0, lng: 10.5 },
      FR: { lat: 46.5, lng: 2.5 },
      IT: { lat: 42.8, lng: 12.8 },
      ES: { lat: 40.0, lng: -4.0 },
      PT: { lat: 39.5, lng: -8.0 },
      NL: { lat: 52.2, lng: 5.3 },
      BE: { lat: 50.6, lng: 4.7 },
      AT: { lat: 47.6, lng: 14.1 },
      CZ: { lat: 49.8, lng: 15.5 },
      GR: { lat: 39.0, lng: 22.0 },
      HU: { lat: 47.2, lng: 19.5 },
      IE: { lat: 53.4, lng: -8.2 },
      SE: { lat: 60.1, lng: 15.6 },
      FI: { lat: 61.9, lng: 25.7 },
      RO: { lat: 45.9, lng: 25.0 },
      BG: { lat: 42.7, lng: 25.4 },
      DK: { lat: 56.0, lng: 9.5 },
    };
    return map[iso] ?? { lat: 50, lng: 10 };
  }

  const pinLocation = async (which: 'origin' | 'dest') => {
    setPinning(which);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Location needed', 'Grant location so we can pin your origin or destination.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      if (which === 'origin') setOriginCoords(point);
      else setDestCoords(point);
    } finally {
      setPinning(null);
    }
  };

  const submit = async () => {
    if (!originCity || !destCity || originIso === destIso) {
      Alert.alert('Missing route', 'Add origin and destination cities (different countries).');
      return;
    }
    const origin = originCoords ?? fallbackCentroid(originIso.toUpperCase());
    const dest = destCoords ?? fallbackCentroid(destIso.toUpperCase());
    try {
      await create.mutateAsync({
        originCountryIso2: originIso.toUpperCase(),
        originCity,
        originLocation: origin,
        destinationCountryIso2: destIso.toUpperCase(),
        destinationCity: destCity,
        destinationLocation: dest,
        departAt: new Date(Date.now() + (Number(days) || 7) * SECONDS_DAY * 1000),
        slotsTotal: Math.max(1, Number(slots) || 6),
        defaultPerSlotFee: Math.max(0, Number(fee) || 5),
        currency: 'EUR',
      });
      Alert.alert('Trip posted', 'Buyers in your destination city can now reserve a slot.');
      router.back();
    } catch (e) {
      Alert.alert('Could not post', e instanceof Error ? e.message : 'Try again.');
    }
  };

  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
    >
      <Text className="text-ink font-serif text-3xl">Post a trip</Text>
      <Text className="text-ash mt-2 text-sm">
        Set the route, the date, and how many slots you can spare. We charge a small platform fee on
        each completed reservation.
      </Text>

      <View className="mt-6" style={{ gap: 16 }}>
        <Field label="Origin country (ISO2)">
          <TextInput
            value={originIso}
            onChangeText={(t) => setOriginIso(t.toUpperCase().slice(0, 2))}
            className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
          />
        </Field>
        <Field label="Origin city">
          <View className="flex-row" style={{ gap: 8 }}>
            <TextInput
              value={originCity}
              onChangeText={setOriginCity}
              placeholder="Warsaw"
              placeholderTextColor="#9A9081"
              style={{ flex: 1 }}
              className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Use my current location for origin"
              onPress={() => pinLocation('origin')}
              disabled={pinning !== null}
              className="border-ink/15 justify-center rounded-2xl border px-4"
            >
              <Text className="text-ink/80 text-xs">
                {pinning === 'origin' ? '…' : originCoords ? 'Pinned' : 'Pin me'}
              </Text>
            </TouchableOpacity>
          </View>
        </Field>
        <Field label="Destination country (ISO2)">
          <TextInput
            value={destIso}
            onChangeText={(t) => setDestIso(t.toUpperCase().slice(0, 2))}
            className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
          />
        </Field>
        <Field label="Destination city">
          <View className="flex-row" style={{ gap: 8 }}>
            <TextInput
              value={destCity}
              onChangeText={setDestCity}
              placeholder="Munich"
              placeholderTextColor="#9A9081"
              style={{ flex: 1 }}
              className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
            />
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Use my current location for destination"
              onPress={() => pinLocation('dest')}
              disabled={pinning !== null}
              className="border-ink/15 justify-center rounded-2xl border px-4"
            >
              <Text className="text-ink/80 text-xs">
                {pinning === 'dest' ? '…' : destCoords ? 'Pinned' : 'Pin me'}
              </Text>
            </TouchableOpacity>
          </View>
        </Field>
        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <Field label="Depart in (days)">
              <TextInput
                value={days}
                onChangeText={setDays}
                keyboardType="number-pad"
                className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Slots">
              <TextInput
                value={slots}
                onChangeText={setSlots}
                keyboardType="number-pad"
                className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
              />
            </Field>
          </View>
        </View>
        <Field label="Default fee per slot (EUR)">
          <TextInput
            value={fee}
            onChangeText={setFee}
            keyboardType="decimal-pad"
            className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
          />
        </Field>
      </View>

      <TouchableOpacity onPress={submit} className="bg-ink mt-8 rounded-full py-4">
        <Text className="text-paper text-center font-medium">Publish trip</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-ink text-sm font-medium">{label}</Text>
      <View className="mt-2">{children}</View>
    </View>
  );
}
