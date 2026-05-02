import { Stack } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { Card } from '../src/components/Card';
import { KpiTile } from '../src/components/KpiTile';
import { trpc } from '../src/lib/trpc';

/**
 * Mobile read of the traction page. Pulls live KPI snapshots from the
 * `traction.weeklyGrowth` procedure so investors and journalists can show a
 * partner the same numbers they see on the web app — without a redirect.
 */
export default function TractionScreen() {
  const traction = trpc.traction.weeklyGrowth.useQuery({ weeks: 12 }, { retry: false });
  const summary = trpc.traction.liveCounts.useQuery(undefined, { retry: false });

  return (
    <>
      <Stack.Screen options={{ title: 'Traction' }} />
      <ScrollView
        className="bg-paper flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
      >
        <Text className="text-ash text-xs tracking-widest uppercase">Eushop · Traction</Text>
        <Text className="text-ink mt-2 font-serif text-3xl">Numbers, not vibes.</Text>
        <Text className="text-ink/70 mt-3 text-base leading-relaxed">
          Live counters straight from the database. Updated every page load — no marketing layer
          between you and the truth.
        </Text>

        {summary.isLoading ? (
          <View className="mt-8 items-center">
            <ActivityIndicator />
          </View>
        ) : summary.isError ? (
          <Card className="mt-8">
            <Text className="text-ink font-medium">Traction service unavailable.</Text>
            <Text className="text-ink/70 mt-1 text-sm">Try again in a moment.</Text>
          </Card>
        ) : summary.data ? (
          <View className="mt-6 flex-row flex-wrap gap-2">
            <KpiTile label="Signups" value={summary.data.signups} />
            <KpiTile label="Listings" value={summary.data.listings} />
            <KpiTile label="Requests" value={summary.data.requests} />
            <KpiTile label="Trips" value={summary.data.tripsPosted} />
            <KpiTile label="Confirmed" value={summary.data.reservationsConfirmed} />
            <KpiTile label="Completed" value={summary.data.reservationsCompleted} />
          </View>
        ) : null}

        <Text className="text-ink mt-10 font-serif text-xl">Last 12 weeks</Text>
        {traction.isLoading ? (
          <View className="mt-4">
            <ActivityIndicator />
          </View>
        ) : traction.data ? (
          <View className="mt-3 gap-2">
            {traction.data.map((row) => (
              <Card key={row.week}>
                <Text className="text-ink font-medium">{row.week}</Text>
                <Text className="text-ink/70 mt-1 text-sm">
                  {row.signups} signups · {row.trips} trips · {row.reservations} reservations
                </Text>
              </Card>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </>
  );
}
