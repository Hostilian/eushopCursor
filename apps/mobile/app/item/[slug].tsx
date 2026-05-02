import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function ItemScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const router = useRouter();
  const item = FOOD_ITEMS.find((i) => i.slug === slug);
  if (!item) return null;
  const country = COUNTRIES.find((c) => c.iso2 === item.originCountryIso2);
  const palette = countryPalette[item.originCountryIso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ paddingBottom: 64 }}>
      <View style={{ backgroundColor: palette.primary }} className="px-6 pt-10 pb-12">
        <Text style={{ color: palette.accent, opacity: 0.7 }} className="text-xs uppercase tracking-widest">
          {country?.flagEmoji} {country?.name} · {item.categorySlug}
        </Text>
        <Text style={{ color: palette.accent }} className="mt-4 font-serif text-5xl">
          {item.name}
        </Text>
        {item.aka?.length ? (
          <Text style={{ color: palette.accent, opacity: 0.7 }} className="mt-2 text-xs uppercase tracking-widest">
            aka {item.aka.join(' · ')}
          </Text>
        ) : null}
        <Text style={{ color: palette.accent, opacity: 0.85 }} className="mt-6 text-base leading-relaxed">
          {item.description}
        </Text>
      </View>

      <View className="px-6 pt-8" style={{ gap: 12 }}>
        <TouchableOpacity
          className="rounded-full bg-ink py-4"
          onPress={() => router.push('/(tabs)')}
        >
          <Text className="text-center text-paper font-medium">See active listings</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="rounded-full border border-ink/15 py-4"
          onPress={() => router.push('/request/new')}
        >
          <Text className="text-center text-ink font-medium">Post a request</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="rounded-full border border-ink/15 py-4"
          onPress={async () => {
            const ok = await Sharing.isAvailableAsync();
            if (ok) await Sharing.shareAsync(`https://eushop.eu/items/${item.slug}`);
          }}
        >
          <Text className="text-center text-ink font-medium">Share this item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
