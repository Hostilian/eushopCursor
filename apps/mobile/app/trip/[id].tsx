import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
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
import { calculatePlatformFeeCents } from '@eushop/validators';
import { ProductPicker, type ProductPickerSelection } from '../../src/components/ProductPicker';
import { trpc } from '../../src/lib/trpc';

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
  const platformFee = calculatePlatformFeeCents(Math.round(agreedFee * 100)) / 100;
  const minFee = Number(trip.defaultPerSlotFee) || 0;
  const submitting = reserve.isPending;

  const submit = () => {
    if (!picker.freeformName?.trim()) {
      Alert.alert('Pick an item', 'Tell the traveller what to grab.');
      return;
    }
    if (agreedFee + 1e-6 < minFee) {
      Alert.alert('Below minimum', `Minimum slot fee for this trip is €${minFee.toFixed(2)}.`);
      return;
    }
    Alert.alert(
      'Confirm reservation',
      `${qty}× ${picker.freeformName}: €${agreedFee.toFixed(2)} slot fee + €${platformFee.toFixed(2)} platform fee.`,
      [
        { text: 'Back', style: 'cancel' },
        {
          text: 'Reserve',
          style: 'default',
          onPress: async () => {
            try {
              const result = await reserve.mutateAsync({
                tripOfferId: trip.id,
                foodItemId: picker.foodItemId,
                freeformText: picker.freeformName!.trim(),
                qty: Number(qty) || 1,
                agreedFinderFee: agreedFee,
              });
              const webBase = process.env.EXPO_PUBLIC_SITE_URL ?? 'https://eushop.eu';
              if (result.paymentClientSecret) {
                Alert.alert(
                  'Complete payment',
                  'This trip uses a card hold. Open the site to finish authorization.',
                  [
                    { text: 'Later', style: 'cancel' },
                    {
                      text: 'Open site',
                      onPress: () => {
                        void Linking.openURL(`${webBase}/reservations`);
                      },
                    },
                  ],
                );
              } else {
                Alert.alert('Slot reserved', 'The traveller has been notified.');
              }
            } catch (e) {
              Alert.alert('Could not reserve', e instanceof Error ? e.message : 'Try again.');
            }
          },
        },
      ],
    );
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
      {trip.sellerBadges?.includes('verified_bringer') ? (
        <Text className="text-saffron-700 mt-2 text-xs font-semibold tracking-wide uppercase">
          Verified bringer
        </Text>
      ) : null}
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
            <Text className="text-ash text-xs">Agreed slot fee</Text>
            <Text className="text-ink text-xs">€{agreedFee.toFixed(2)}</Text>
          </View>
          <View className="mt-1 flex-row justify-between">
            <Text className="text-ash text-xs">Eushop platform fee</Text>
            <Text className="text-ink text-xs">€{platformFee.toFixed(2)}</Text>
          </View>
          <Text className="text-ash mt-2 text-xs leading-snug">
            Charged when the seller confirms your reservation. Card holds and Stripe checkout are on
            the web today when Connect is enabled for the route.
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Reserve this slot"
          accessibilityState={{ disabled: submitting }}
          onPress={submit}
          disabled={submitting}
          className={`mt-2 rounded-full py-4 ${submitting ? 'bg-ink/60' : 'bg-ink'}`}
        >
          <Text className="text-paper text-center font-medium">
            {submitting ? 'Reserving…' : 'Reserve this slot'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
