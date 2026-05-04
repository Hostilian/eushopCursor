import { COUNTRIES, FOOD_ITEMS } from '@eushop/catalog';
import { countryPalette } from '@eushop/tokens';
import { Link, useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function CountryScreen() {
  const { iso2 } = useLocalSearchParams<{ iso2: string }>();
  const country = COUNTRIES.find((c) => c.iso2.toLowerCase() === iso2?.toLowerCase());
  if (!country) return null;
  const palette = countryPalette[country.iso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
  const items = FOOD_ITEMS.filter((i) => i.originCountryIso2 === country.iso2);

  return (
    <ScrollView className="bg-paper flex-1" contentContainerStyle={{ paddingBottom: 64 }}>
      <View style={{ backgroundColor: palette.primary }} className="px-6 pt-12 pb-16">
        <Text style={{ color: palette.accent }} className="text-7xl">
          {country.flagEmoji}
        </Text>
        <Text style={{ color: palette.accent }} className="mt-8 font-serif text-5xl">
          {country.name}
        </Text>
        <Text
          style={{ color: palette.accent, opacity: 0.85 }}
          className="mt-3 text-base leading-relaxed"
        >
          {country.blurb}
        </Text>
      </View>

      <View className="px-6 pt-8">
        <Text className="text-ash text-xs tracking-widest uppercase">Catalog</Text>
        <Text className="text-ink mt-2 font-serif text-2xl">All {items.length} items</Text>
        <View className="mt-6" style={{ gap: 10 }}>
          {items.map((item) => (
            <Link key={item.slug} href={`/item/${item.slug}`} asChild>
              <TouchableOpacity className="border-ink/10 bg-porcelain rounded-2xl border p-4">
                <Text className="text-ink font-serif text-base">{item.name}</Text>
                <Text className="text-ash mt-1 text-xs" numberOfLines={2}>
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
