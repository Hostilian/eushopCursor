import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function CountryScreen() {
  const { iso2 } = useLocalSearchParams<{ iso2: string }>();
  const country = COUNTRIES.find((c) => c.iso2.toLowerCase() === iso2?.toLowerCase());
  if (!country) return null;
  const palette = countryPalette[country.iso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
  const items = FOOD_ITEMS.filter((i) => i.originCountryIso2 === country.iso2);

  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ paddingBottom: 64 }}>
      <View style={{ backgroundColor: palette.primary }} className="px-6 pt-12 pb-16">
        <Text style={{ color: palette.accent }} className="text-7xl">
          {country.flagEmoji}
        </Text>
        <Text style={{ color: palette.accent }} className="mt-8 font-serif text-5xl">
          {country.name}
        </Text>
        <Text style={{ color: palette.accent, opacity: 0.85 }} className="mt-3 text-base leading-relaxed">
          {country.blurb}
        </Text>
      </View>

      <View className="px-6 pt-8">
        <Text className="text-xs uppercase tracking-widest text-ash">Catalog</Text>
        <Text className="mt-2 font-serif text-2xl text-ink">All {items.length} items</Text>
        <View className="mt-6" style={{ gap: 10 }}>
          {items.map((item) => (
            <Link key={item.slug} href={`/item/${item.slug}`} asChild>
              <TouchableOpacity className="rounded-2xl border border-ink/10 bg-porcelain p-4">
                <Text className="font-serif text-base text-ink">{item.name}</Text>
                <Text className="mt-1 text-xs text-ash" numberOfLines={2}>
                  {item.description}
                </Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
