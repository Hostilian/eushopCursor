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
  const [destIso, setDestIso] = useState('DE');
  const [destCity, setDestCity] = useState('');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [days, setDays] = useState('7');
  const [slots, setSlots] = useState('6');
  const [fee, setFee] = useState('5');
  const [locating, setLocating] = useState(false);

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Location needed', 'Grant location to pin your destination cell.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setDestCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    if (!originCity || !destCity || originIso === destIso) {
      Alert.alert('Missing route', 'Add origin and destination cities (different countries).');
      return;
    }
    const dest = destCoords ?? { lat: 50, lng: 10 };
    try {
      await create.mutateAsync({
        originCountryIso2: originIso.toUpperCase(),
        originCity,
        originLocation: { lat: 50, lng: 19 },
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
          <TextInput
            value={originCity}
            onChangeText={setOriginCity}
            placeholder="Warsaw"
            placeholderTextColor="#9A9081"
            className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
          />
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
              onPress={useMyLocation}
              disabled={locating}
              className="border-ink/15 justify-center rounded-2xl border px-4"
            >
              <Text className="text-ink/80 text-xs">
                {locating ? '…' : destCoords ? 'Pinned' : 'Pin me'}
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
