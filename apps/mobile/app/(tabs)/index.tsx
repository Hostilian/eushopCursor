import { countryPalette } from '@eushop/design-tokens';
import { Surface } from '@eushop/ui-mobile';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { KpiTile } from '../../src/components/KpiTile';
import { trpc } from '../../src/lib/trpc';

export default function TodayScreen() {
  const router = useRouter();
  const recent = trpc.listings.recent.useQuery({ limit: 12 }, { retry: false });
  const rows =
    recent.data?.slice(0, 3).map((r) => ({
      id: r.id,
      freeformName: r.freeformName,
      approximateCity: r.approximateCity,
      countryIso2: r.countryIso2,
      finderFee: r.finderFee,
      photos: r.photos,
    })) ?? [];

  return (
    <ScrollView className="bg-paper flex-1" contentContainerStyle={{ paddingBottom: 88 }}>
      <View className="px-6 pt-8 pb-4">
        <Text className="text-ash text-xs tracking-widest uppercase">Today near you</Text>
        <Text className="text-ink mt-2 font-serif text-4xl">Fresh in your cell.</Text>
        <Text className="text-ink/70 mt-2 text-sm">
          Real listings within a 5 km cell of where you are. Pull to refresh.
        </Text>
        <View className="mt-5 flex-row gap-2">
          <KpiTile label="Live" value={rows.length} />
          <KpiTile label="Cell" value="5 km" />
          <KpiTile label="Handoff" value="Public" />
        </View>
      </View>

      <View className="px-6">
        {rows.length === 0 ? (
          <EmptyState
            title="Quiet in your cell"
            hint="Be the first to share — or post a request and we'll ping you when a matching listing or trip lands."
          />
        ) : (
          rows.map((l) => {
            const palette = countryPalette[l.countryIso2] ?? {
              primary: '#3B2F22',
              accent: '#FAF7F2',
            };
            const uri = l.photos[0]?.url;
            return (
              <TouchableOpacity
                key={l.id}
                activeOpacity={0.9}
                className="mb-4"
                onPress={() => router.push('/countries')}
              >
                <Card className="overflow-hidden p-0">
                  <View className="relative h-44 w-full">
                    {uri ? (
                      <Image source={{ uri }} className="h-full w-full" contentFit="cover" />
                    ) : (
                      <View
                        className="h-full w-full items-center justify-center"
                        style={{ backgroundColor: palette.primary }}
                      >
                        <Text style={{ color: palette.accent }} className="font-serif text-2xl">
                          {l.freeformName ?? 'Listing'}
                        </Text>
                      </View>
                    )}
                    <View className="absolute right-0 bottom-0 left-0 bg-black/45 px-4 py-3">
                      <Text className="text-paper font-serif text-lg">
                        {l.freeformName ?? 'Listing'}
                      </Text>
                      <Text className="text-paper/80 text-xs">
                        {l.approximateCity} · €{l.finderFee}
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            );
          })
        )}
      </View>

      <View className="mt-4 px-6">
        <Surface>
          <Text className="text-ink font-serif text-lg">Discover more</Text>
          <Text className="text-ink/70 mt-1 text-sm">Browse countries or post a request.</Text>
          <View className="mt-4 flex-row gap-3">
            <TouchableOpacity
              className="bg-ink rounded-full px-4 py-2.5"
              onPress={() => router.push('/countries')}
            >
              <Text className="text-paper text-sm font-medium">Countries</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="border-ink/15 rounded-full border px-4 py-2.5"
              onPress={() => router.push('/request/new')}
            >
              <Text className="text-ink text-sm font-medium">Request</Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </View>
    </ScrollView>
  );
}
