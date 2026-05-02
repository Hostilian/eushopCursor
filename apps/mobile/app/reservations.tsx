import { Stack, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Card } from '../src/components/Card';
import { EmptyState } from '../src/components/EmptyState';
import { trpc } from '../src/lib/trpc';

/**
 * Mobile mirror of `apps/web/src/app/(product)/reservations/page.tsx`.
 * Read-only for now; cancel and "mark received" actions will live on each
 * trip detail screen so the list stays scannable.
 */
export default function ReservationsScreen() {
  const router = useRouter();
  const reservations = trpc.trips.mineReservations.useQuery(undefined, { retry: false });

  return (
    <>
      <Stack.Screen options={{ title: 'Reservations' }} />
      <View className="bg-paper flex-1">
        <View className="px-6 pt-8 pb-2">
          <Text className="text-ash text-xs tracking-widest uppercase">Buyer dashboard</Text>
          <Text className="text-ink mt-1 font-serif text-3xl">Your reservations</Text>
          <Text className="text-ink/70 mt-2 text-sm">
            Tap any row to open the trip and message the traveller.
          </Text>
        </View>

        {reservations.isLoading ? (
          <View className="mt-12 items-center">
            <ActivityIndicator />
          </View>
        ) : reservations.isError ? (
          <View className="mt-6 px-6">
            <EmptyState title="Couldn’t load your reservations" hint="Sign in or pull to retry." />
          </View>
        ) : (
          <FlatList
            data={reservations.data ?? []}
            keyExtractor={(r) => r.id}
            contentContainerStyle={{ padding: 24, paddingBottom: 88 }}
            refreshControl={
              <RefreshControl
                refreshing={reservations.isFetching}
                onRefresh={() => reservations.refetch()}
              />
            }
            ListEmptyComponent={
              <EmptyState
                title="No reservations yet"
                hint="Browse trips on the Trips tab and reserve a slot."
              />
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={`Open trip for ${item.freeformText}`}
                onPress={() => router.push(`/trip/${item.tripOfferId}`)}
                className="mb-3"
              >
                <Card>
                  <Text className="text-ink font-medium">
                    {item.qty}× {item.freeformText}
                  </Text>
                  <View className="mt-2 flex-row flex-wrap gap-2">
                    <Text className="bg-porcelain text-ink/70 rounded-full px-2 py-0.5 text-xs">
                      €{Number(item.agreedFinderFee).toFixed(2)} fee
                    </Text>
                    <Text className="bg-porcelain text-ink/70 rounded-full px-2 py-0.5 text-xs">
                      +€{Number(item.platformFee).toFixed(2)} platform
                    </Text>
                    <Text className="bg-saffron-100 text-saffron-800 rounded-full px-2 py-0.5 text-xs">
                      {item.status}
                    </Text>
                  </View>
                  <Text className="text-ash mt-2 text-[10px]">
                    Booked {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </Card>
              </TouchableOpacity>
            )}
          />
        )}
      </View>
    </>
  );
}
