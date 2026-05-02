import { CameraView, useCameraPermissions } from 'expo-camera';
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

  const submit = async () => {
    try {
      await create.mutateAsync({
        freeformName: name,
        qty: Number(qty) || 1,
        unit: 'item',
        finderFee: Number(fee) || 0,
        currency: 'EUR',
        freshness,
        photos: [{ url: 'https://placehold.co/1200x1200/FAF7F2/3B2F22?text=Photo' }],
        approximateCity: city,
        location: { lat: 52.52, lng: 13.405 },
      });
      Alert.alert('Listed', 'Your listing is live within your 5km cell.');
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  if (showCamera && permission?.granted) {
    return (
      <View className="flex-1 bg-ink">
        <CameraView className="flex-1" />
        <View className="absolute inset-x-0 bottom-10 items-center" style={{ gap: 12 }}>
          <TouchableOpacity
            className="h-16 w-16 rounded-full border-4 border-paper bg-paper"
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
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 24, paddingBottom: 64 }}>
      <Text className="font-serif text-3xl text-ink">Share your stash</Text>
      <Text className="mt-2 text-sm text-ash">
        Approximate city only — never your exact address.
      </Text>

      <View className="mt-8" style={{ gap: 16 }}>
        <Field label="Item">
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Wedel Mieszanka tin (300g)"
            placeholderTextColor="#9A9081"
            className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-ink"
          />
        </Field>

        <Field label="Approximate city">
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Berlin Mitte"
            placeholderTextColor="#9A9081"
            className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-ink"
          />
        </Field>

        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <Field label="Quantity">
              <TextInput
                value={qty}
                onChangeText={setQty}
                keyboardType="number-pad"
                className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-ink"
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Finder's fee (EUR)">
              <TextInput
                value={fee}
                onChangeText={setFee}
                keyboardType="decimal-pad"
                className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-ink"
              />
            </Field>
          </View>
        </View>

        <View>
          <Text className="text-sm font-medium text-ink">Freshness</Text>
          <View className="mt-2 flex-row flex-wrap" style={{ gap: 8 }}>
            {FRESHNESS.map((f) => (
              <TouchableOpacity
                key={f.v}
                onPress={() => setFreshness(f.v)}
                className={`rounded-full border px-3 py-2 ${
                  freshness === f.v
                    ? 'border-ink bg-ink'
                    : 'border-ink/15 bg-transparent'
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
          className="rounded-2xl border border-dashed border-ink/20 bg-porcelain p-6"
          onPress={async () => {
            if (!permission?.granted) {
              const r = await requestPermission();
              if (!r.granted) return;
            }
            setShowCamera(true);
          }}
        >
          <Text className="text-center text-sm text-ash">📷 Add photos with the camera</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-4 rounded-full bg-ink py-4" onPress={submit}>
          <Text className="text-center text-paper font-medium">Publish listing</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View>
      <Text className="text-sm font-medium text-ink">{label}</Text>
      <View className="mt-2">{children}</View>
    </View>
  );
}
