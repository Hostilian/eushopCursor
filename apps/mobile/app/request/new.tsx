import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';

export default function NewRequestScreen() {
  const router = useRouter();
  const create = trpc.requests.create.useMutation();
  const [item, setItem] = useState('');
  const [city, setCity] = useState('');
  const [maxFee, setMaxFee] = useState('10');
  const [radius, setRadius] = useState('25');

  const submit = async () => {
    try {
      await create.mutateAsync({
        freeformText: item,
        location: { lat: 52.52, lng: 13.405 },
        approximateCity: city,
        radiusKm: Number(radius) || 25,
        maxFinderFee: Number(maxFee) || 0,
        currency: 'EUR',
        notifyOnMatch: true,
      });
      Alert.alert('Posted', 'We\u2019ll ping you the moment a match appears.');
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 24, paddingBottom: 64 }}>
      <Text className="font-serif text-3xl text-ink">Tell us what to find</Text>

      <View className="mt-8" style={{ gap: 16 }}>
        <Field label="What are you looking for?">
          <TextInput
            value={item}
            onChangeText={setItem}
            placeholder="Krówki Mleczne — Wedel"
            placeholderTextColor="#9A9081"
            className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-ink"
          />
        </Field>
        <Field label="Your approximate city">
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="Munich Glockenbach"
            placeholderTextColor="#9A9081"
            className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-ink"
          />
        </Field>
        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <Field label="Radius (km)">
              <TextInput
                value={radius}
                onChangeText={setRadius}
                keyboardType="number-pad"
                className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-ink"
              />
            </Field>
          </View>
          <View className="flex-1">
            <Field label="Max fee (EUR)">
              <TextInput
                value={maxFee}
                onChangeText={setMaxFee}
                keyboardType="decimal-pad"
                className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-ink"
              />
            </Field>
          </View>
        </View>
        <TouchableOpacity className="mt-4 rounded-full bg-ink py-4" onPress={submit}>
          <Text className="text-center text-paper font-medium">Post request</Text>
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
