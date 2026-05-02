import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { Surface } from '@eushop/ui-mobile';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link, useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { trpc } from '../../src/lib/trpc';

const FEATURED_COUNTRIES = ['PL', 'IT', 'DE', 'GR', 'FR', 'NL'];

export default function DiscoverScreen() {
  const router = useRouter();
  const recent = trpc.listings.recent.useQuery(undefined, { retry: false });
  const featured = COUNTRIES.filter((c) => FEATURED_COUNTRIES.includes(c.iso2));
  const sample = FOOD_ITEMS.slice(0, 8);

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ paddingBottom: 64 }}>
      <View className="px-6 pt-10 pb-8">
        <Surface>
          <Text className="text-xs uppercase tracking-widest text-ash">Find a taste of home</Text>
          <Text className="mt-3 font-serif text-5xl text-ink leading-[1.05]">
            Just down the street.
          </Text>
          <Text className="mt-4 text-base leading-relaxed text-ink/70">
            Krówki in Munich. Mastiha in Lisbon. Sült in Stockholm. Held by the neighbours who
            brought it back.
          </Text>
          <View className="mt-6 flex-row gap-3">
            <TouchableOpacity
              className="rounded-full bg-ink px-5 py-3"
              onPress={() => router.push('/listing/new')}
            >
              <Text className="text-paper font-medium">Share something</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="rounded-full border border-ink/15 px-5 py-3"
              onPress={() => router.push('/request/new')}
            >
              <Text className="text-ink font-medium">Post a request</Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </View>

      <Section
        title={`A taste of ${featured.length} home countries`}
        action={{ label: 'All', onPress: () => router.push('/countries') }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: 24 }}>
          {featured.map((c) => {
            const palette = countryPalette[c.iso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
            return (
              <Link key={c.iso2} href={`/country/${c.iso2.toLowerCase()}`} asChild>
                <TouchableOpacity
                  style={{ backgroundColor: palette.primary }}
                  className="w-44 rounded-3xl p-5"
                >
                  <Text style={{ color: palette.accent }} className="text-3xl">
                    {c.flagEmoji}
                  </Text>
                  <Text style={{ color: palette.accent }} className="mt-12 font-serif text-xl">
                    {c.name}
                  </Text>
                  <Text style={{ color: palette.accent, opacity: 0.7 }} className="mt-1 text-xs uppercase tracking-widest">
                    {c.region}
                  </Text>
                </TouchableOpacity>
              </Link>
            );
          })}
        </ScrollView>
      </Section>

      <Section title="Latest near you">
        <View className="px-6">
          {(recent.data ?? sample.map((s, i) => ({
            id: `s-${i}`,
            freeformName: s.name,
            approximateCity: 'Berlin Mitte',
            finderFee: ['3', '5', '7'][i % 3]!,
            currency: 'EUR',
            countryIso2: s.originCountryIso2,
            photos: [],
          }))).slice(0, 6).map((l) => {
            const palette = countryPalette[l.countryIso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
            return (
              <View key={l.id} className="mb-3 flex-row items-center gap-4 rounded-2xl border border-ink/10 bg-porcelain p-4">
                <View
                  style={{ backgroundColor: palette.primary }}
                  className="h-14 w-14 items-center justify-center rounded-xl"
                >
                  <Ionicons name="basket-outline" size={22} color={palette.accent} />
                </View>
                <View className="flex-1">
                  <Text className="font-serif text-base text-ink">{l.freeformName}</Text>
                  <Text className="text-xs text-ash">{l.approximateCity} · €{l.finderFee} fee</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9A9081" />
              </View>
            );
          })}
        </View>
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: { label: string; onPress: () => void };
  children: React.ReactNode;
}) {
  return (
    <View className="mt-10">
      <View className="flex-row items-end justify-between px-6">
        <Text className="font-serif text-2xl text-ink">{title}</Text>
        {action ? (
          <TouchableOpacity onPress={action.onPress}>
            <Text className="text-xs uppercase tracking-widest text-saffron-700">{action.label}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <View className="mt-4">{children}</View>
    </View>
  );
}

void Image; // ensure expo-image is part of the bundle
