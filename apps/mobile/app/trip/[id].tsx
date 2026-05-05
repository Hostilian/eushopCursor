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
import { formatMessage, pickString, useMobileMessages } from '../../src/lib/i18n';
import { trpc } from '../../src/lib/trpc';

export default function TripDetailScreen() {
  const messages = useMobileMessages();
  const params = useLocalSearchParams<{ id: string }>();
  const id = String(params.id ?? '');
  const { data, isLoading, error } = trpc.trips.byId.useQuery({ id }, { retry: false });
  const reserve = trpc.trips.reserve.useMutation();
  const [picker, setPicker] = useState<ProductPickerSelection>({ photos: [] });
  const [qty, setQty] = useState('1');
  const [fee, setFee] = useState('5');

  const t = (path: string[], fb: string) => pickString(messages, path, fb);

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
          {error?.message ?? t(['tripDetailMobile', 'notFound'], 'Trip not found.')}
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
      Alert.alert(
        t(['tripDetailMobile', 'pickItemTitle'], 'Pick an item'),
        t(['tripDetailMobile', 'pickItemBody'], 'Tell the traveller what to grab.'),
      );
      return;
    }
    if (agreedFee + 1e-6 < minFee) {
      Alert.alert(
        t(['tripDetailMobile', 'belowMinTitle'], 'Below minimum'),
        formatMessage(
          t(['tripDetailMobile', 'belowMinBody'], 'Minimum slot fee for this trip is €{min}.'),
          { min: minFee.toFixed(2) },
        ),
      );
      return;
    }
    Alert.alert(
      t(['tripDetailMobile', 'confirmTitle'], 'Confirm reservation'),
      formatMessage(
        t(
          ['tripDetailMobile', 'confirmBody'],
          '{qty}× {item}: €{slotFee} slot fee + €{platformFee} platform fee.',
        ),
        {
          qty,
          item: picker.freeformName ?? '',
          slotFee: agreedFee.toFixed(2),
          platformFee: platformFee.toFixed(2),
        },
      ),
      [
        { text: t(['tripDetailMobile', 'back'], 'Back'), style: 'cancel' },
        {
          text: t(['tripDetailMobile', 'reserve'], 'Reserve'),
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
                  t(['tripDetailMobile', 'paymentHoldTitle'], 'Complete payment'),
                  t(
                    ['tripDetailMobile', 'paymentHoldBody'],
                    'This trip uses a card hold. Open the site to finish authorization.',
                  ),
                  [
                    { text: t(['tripDetailMobile', 'later'], 'Later'), style: 'cancel' },
                    {
                      text: t(['tripDetailMobile', 'openSite'], 'Open site'),
                      onPress: () => {
                        void Linking.openURL(`${webBase}/reservations`);
                      },
                    },
                  ],
                );
              } else {
                Alert.alert(
                  t(['tripDetailMobile', 'slotReservedTitle'], 'Slot reserved'),
                  t(['tripDetailMobile', 'slotReservedBody'], 'The traveller has been notified.'),
                );
              }
            } catch (e) {
              Alert.alert(
                t(['tripDetailMobile', 'reserveErrorTitle'], 'Could not reserve'),
                e instanceof Error
                  ? e.message
                  : t(['tripDetailMobile', 'reserveErrorBody'], 'Try again.'),
              );
            }
          },
        },
      ],
    );
  };

  const reserveCta = t(['tripDetailMobile', 'reserveCta'], 'Reserve this slot');
  const reserving = t(['tripDetailMobile', 'reserving'], 'Reserving…');

  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
    >
      <Text className="text-ink font-serif text-3xl">
        {trip.originCity} → {trip.destinationCity}
      </Text>
      <Text className="text-ash mt-2 text-sm">
        {formatMessage(t(['trips', 'departs'], 'Departs {when}'), {
          when: new Date(trip.departAt).toLocaleDateString(),
        })}{' '}
        ·{' '}
        {formatMessage(t(['trips', 'slotsBadge'], '{available}/{total} slots'), {
          available: String(trip.slotsAvailable),
          total: String(trip.slotsTotal),
        })}
      </Text>
      {trip.sellerBadges?.includes('verified_bringer') ? (
        <Text className="text-saffron-700 mt-2 text-xs font-semibold tracking-wide uppercase">
          {t(['trip', 'verifiedBringer'], 'Verified bringer')}
        </Text>
      ) : null}
      {trip.notes ? <Text className="text-ink/80 mt-4">{trip.notes}</Text> : null}

      <View className="mt-8" style={{ gap: 12 }}>
        <Text className="text-ash text-xs tracking-widest uppercase">
          {t(['tripDetailMobile', 'reserveSectionTitle'], 'Reserve a slot')}
        </Text>
        <ProductPicker value={picker} onChange={setPicker} />

        <View className="flex-row" style={{ gap: 12 }}>
          <View className="flex-1">
            <Text className="text-ink text-sm font-medium">
              {t(['tripDetailMobile', 'qtyShort'], 'Qty')}
            </Text>
            <TextInput
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              className="border-ink/10 bg-paper text-ink mt-1 rounded-2xl border px-4 py-3"
            />
          </View>
          <View className="flex-1">
            <Text className="text-ink text-sm font-medium">
              {t(['tripDetailMobile', 'feeInputLabel'], 'Your offer (EUR)')}
            </Text>
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
            <Text className="text-ash text-xs">
              {t(['tripDetailMobile', 'agreedSlotFeeLabel'], 'Agreed slot fee')}
            </Text>
            <Text className="text-ink text-xs">€{agreedFee.toFixed(2)}</Text>
          </View>
          <View className="mt-1 flex-row justify-between">
            <Text className="text-ash text-xs">
              {t(['tripDetailMobile', 'platformFeeShortLabel'], 'Eushop platform fee')}
            </Text>
            <Text className="text-ink text-xs">€{platformFee.toFixed(2)}</Text>
          </View>
          <Text className="text-ash mt-2 text-xs leading-snug">
            {t(
              ['tripDetailMobile', 'feeFootnote'],
              'Charged when the seller confirms your reservation. Card holds and Stripe checkout are on the web today when Connect is enabled for the route.',
            )}
          </Text>
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={reserveCta}
          accessibilityState={{ disabled: submitting }}
          onPress={submit}
          disabled={submitting}
          className={`mt-2 rounded-full py-4 ${submitting ? 'bg-ink/60' : 'bg-ink'}`}
        >
          <Text className="text-paper text-center font-medium">
            {submitting ? reserving : reserveCta}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
