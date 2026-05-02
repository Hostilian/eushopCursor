import { COUNTRIES } from '@eushop/catalog-data';
import { countryPalette } from '@eushop/design-tokens';
import { Link } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function CountriesScreen() {
  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
    >
      <Text className="text-ash text-xs tracking-widest uppercase">Pick a flag</Text>
      <Text className="text-ink mt-3 font-serif text-4xl">
        All {COUNTRIES.length} home countries.
      </Text>
      <View className="mt-8 flex-row flex-wrap" style={{ gap: 12 }}>
        {COUNTRIES.map((c) => {
          const palette = countryPalette[c.iso2] ?? { primary: '#3B2F22', accent: '#FAF7F2' };
          return (
            <Link key={c.iso2} href={`/country/${c.iso2.toLowerCase()}`} asChild>
              <TouchableOpacity
                style={{ backgroundColor: palette.primary, width: '47%' }}
                className="h-32 justify-between rounded-3xl p-4"
              >
                <Text style={{ color: palette.accent }} className="text-3xl">
                  {c.flagEmoji}
                </Text>
                <View>
                  <Text style={{ color: palette.accent }} className="font-serif text-base">
                    {c.name}
                  </Text>
                  <Text
                    style={{ color: palette.accent, opacity: 0.7 }}
                    className="text-[10px] tracking-widest uppercase"
                  >
                    {c.iso2}
                  </Text>
                </View>
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>
    </ScrollView>
  );
}
