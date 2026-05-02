import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';

const FRESHNESS = [
  { v: 'today', l: 'Best today' },
  { v: '3-days', l: '3 days' },
  { v: 'week', l: 'This week' },
  { v: 'month', l: 'This month' },
  { v: 'shelf-stable', l: 'Shelf-stable' },
] as const;

export default function NewListingScreen() {
  const router = useRouter();
  const create = trpc.listings.create.useMutation();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [fee, setFee] = useState('5');
  const [qty, setQty] = useState('1');
  const [freshness, setFreshness] = useState<(typeof FRESHNESS)[number]['v']>('week');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [photos, setPhotos] = useState<{ url: string }[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert('Permission needed', 'We need location to show your listing to neighbours.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({});
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch (e) {
      Alert.alert('Could not locate', e instanceof Error ? e.message : 'Try again.');
    } finally {
      setLocating(false);
    }
  };

  const submit = async () => {
    if (photos.length === 0) {
      Alert.alert('Add a photo', 'Snap at least one photo so buyers can recognise your stash.');
      return;
    }
    if (!coords) {
      Alert.alert(
        'Need your location',
        'Tap "Use my location" so we can show this listing to neighbours near you.',
      );
      return;
    }
    try {
      await create.mutateAsync({
        freeformName: name,
        qty: Number(qty) || 1,
        unit: 'item',
        finderFee: Number(fee) || 0,
        currency: 'EUR',
        freshness,
        photos,
        approximateCity: city,
        location: coords,
      });
      Alert.alert('Listed', 'Your listing is live to people near you.');
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  if (showCamera && permission?.granted) {
    return (
      <View className="bg-ink flex-1">
        <CameraView className="flex-1" />
        <View className="absolute inset-x-0 bottom-10 items-center" style={{ gap: 12 }}>
          <TouchableOpacity
            className="border-paper bg-paper h-16 w-16 rounded-full border-4"
            onPress={() => setShowCamera(false)}
          />
          <TouchableOpacity onPress={() => setShowCamera(false)}>
            <Text className="text-paper">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
    >
      <Text className="text-ink font-serif text-3xl">Share your stash</Text>
      <Text className="text-ash mt-2 text-sm">
        Approximate city only — never your exact address.
      </Text>

      <View className="mt-8" style={{ gap: 16 }}>
        <Field label="Item">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Wedel Mieszanka tin (300g)"
            placeholderTextColor="#9A9081"
            className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
          />
        </Field>

        <Field label="Approximate city">
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Berlin Mitte"
            placeholderTextColor="#9A9081"
            className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
          />
        </Field>

        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <Field label="Quantity">
              <TextInput
                value={qty}
                onChangeText={setQty}
                keyboardType="number-pad"
                className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Finder's fee (EUR)">
              <TextInput
                value={fee}
                onChangeText={setFee}
                keyboardType="decimal-pad"
                className="border-ink/10 bg-paper text-ink rounded-2xl border px-4 py-3"
              />
            </Field>
          </View>
        </View>

        <View>
          <Text className="text-ink text-sm font-medium">Freshness</Text>
          <View className="mt-2 flex-row flex-wrap" style={{ gap: 8 }}>
            {FRESHNESS.map((f) => (
              <TouchableOpacity
                key={f.v}
                onPress={() => setFreshness(f.v)}
                className={`rounded-full border px-3 py-2 ${
                  freshness === f.v ? 'border-ink bg-ink' : 'border-ink/15 bg-transparent'
                }`}
              >
                <Text className={freshness === f.v ? 'text-paper text-xs' : 'text-ink/70 text-xs'}>
                  {f.l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          className="border-ink/20 bg-porcelain rounded-2xl border border-dashed p-6"
          onPress={async () => {
            if (!permission?.granted) {
              const r = await requestPermission();
              if (!r.granted) return;
            }
            setShowCamera(true);
          }}
        >
          <Text className="text-ash text-center text-sm">📷 Add photos with the camera</Text>
        </TouchableOpacity>

        <TouchableOpacity className="bg-ink mt-4 rounded-full py-4" onPress={submit}>
          <Text className="text-paper text-center font-medium">Publish listing</Text>
        </TouchableOpacity>
      </View>
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
