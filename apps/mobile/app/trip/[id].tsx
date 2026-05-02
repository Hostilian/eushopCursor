import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ProductPicker, type ProductPickerSelection } from '../../src/components/ProductPicker';
import { trpc } from '../../src/lib/trpc';

const PLATFORM_FEE_RATE = 0.12;
const PLATFORM_FEE_FLOOR_CENTS = 150;

export default function TripDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = String(params.id ?? '');
  const { data, isLoading, error } = trpc.trips.byId.useQuery({ id }, { retry: false });
  const reserve = trpc.trips.reserve.useMutation();
  const [picker, setPicker] = useState<ProductPickerSelection>({ photos: [] });
  const [qty, setQty] = useState('1');
  const [fee, setFee] = useState('5');

  if (isLoading) {
    return (
      <View className="bg-paper flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }
  if (error || !data) {
    return (
      <View className="bg-paper flex-1 items-center justify-center p-6">
        <Ionicons name="airplane-outline" size={32} color="#9A9081" />
        <Text className="text-ash mt-3 text-center text-sm">
          {error?.message ?? 'Trip not found.'}
        </Text>
      </View>
    );
  }

  const { trip } = data;
  const agreedFee = Number(fee) || 0;
  const platformFee = Math.max(PLATFORM_FEE_FLOOR_CENTS / 100, agreedFee * PLATFORM_FEE_RATE);

  const submit = async () => {
    if (!picker.freeformName?.trim()) {
      Alert.alert('Pick an item', 'Tell the traveller what to grab.');
      return;
    }
    try {
      await reserve.mutateAsync({
        tripOfferId: trip.id,
        foodItemId: picker.foodItemId,
        freeformText: picker.freeformName.trim(),
        qty: Number(qty) || 1,
        agreedFinderFee: agreedFee,
      });
      Alert.alert('Slot reserved', 'The traveller has been notified.');
    } catch (e) {
      Alert.alert('Could not reserve', e instanceof Error ? e.message : 'Try again.');
    }
  };

  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
    >
      <Text className="text-ink font-serif text-3xl">
        {trip.originCity} → {trip.destinationCity}
      </Text>
      <Text className="text-ash mt-2 text-sm">
        Departs {new Date(trip.departAt).toLocaleDateString()} · {trip.slotsAvailable}/
        {trip.slotsTotal} slots
      </Text>
      {trip.notes ? <Text className="text-ink/80 mt-4">{trip.notes}</Text> : null}

      <View className="mt-8" style={{ gap: 12 }}>
        <Text className="text-ash text-xs tracking-widest uppercase">Reserve a slot</Text>
        <ProductPicker value={picker} onChange={setPicker} />

        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <Text className="text-ink text-sm font-medium">Qty</Text>
            <TextInput
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              className="border-ink/10 bg-paper text-ink mt-1 rounded-2xl border px-4 py-3"
            />
          </View>
          <View className="flex-1">
            <Text className="text-ink text-sm font-medium">Your offer (EUR)</Text>
            <TextInput
              value={fee}
              onChangeText={setFee}
              keyboardType="decimal-pad"
              className="border-ink/10 bg-paper text-ink mt-1 rounded-2xl border px-4 py-3"
            />
          </View>
        </View>

        <View className="border-ink/10 rounded-2xl border bg-white p-4">
          <View className="flex-row justify-between">
            <Text className="text-ash text-xs">Finder's fee</Text>
            <Text className="text-ink text-xs">€{agreedFee.toFixed(2)}</Text>
          </View>
          <View className="mt-1 flex-row justify-between">
            <Text className="text-ash text-xs">Eushop platform fee</Text>
            <Text className="text-ink text-xs">€{platformFee.toFixed(2)}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={submit} className="bg-ink mt-2 rounded-full py-4">
          <Text className="text-paper text-center font-medium">Reserve this slot</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
