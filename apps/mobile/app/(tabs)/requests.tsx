import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const SAMPLES = [
  { item: 'Krówki Mleczne', city: 'Munich', maxFee: 7, country: '🇵🇱' },
  { item: 'Mastiha of Chios', city: 'Lisbon', maxFee: 12, country: '🇬🇷' },
  { item: 'Sült', city: 'Stockholm', maxFee: 8, country: '🇪🇪' },
  { item: 'Halloumi PDO', city: 'Vienna', maxFee: 10, country: '🇨🇾' },
  { item: 'Cuberdon', city: 'Madrid', maxFee: 5, country: '🇧🇪' },
  { item: 'Tayto Cheese & Onion', city: 'Amsterdam', maxFee: 6, country: '🇮🇪' },
];

export default function RequestsScreen() {
  const router = useRouter();
  return (
    <ScrollView className="flex-1 bg-paper" contentContainerStyle={{ padding: 24, paddingBottom: 64 }}>
      <View className="flex-row items-end justify-between">
        <View className="flex-1">
          <Text className="text-xs uppercase tracking-widest text-ash">Wanted</Text>
          <Text className="mt-3 font-serif text-4xl text-ink">Open requests.</Text>
        </View>
        <TouchableOpacity
          className="rounded-full bg-ink px-4 py-2.5"
          onPress={() => router.push('/request/new')}
        >
          <Text className="text-paper text-sm font-medium">New</Text>
        </TouchableOpacity>
      </View>

      <View className="mt-8" style={{ gap: 12 }}>
        {SAMPLES.map((r, i) => (
          <View key={i} className="rounded-3xl border border-ink/10 bg-porcelain p-5">
            <View className="flex-row items-start gap-4">
              <Text className="text-3xl">{r.country}</Text>
              <View className="flex-1">
                <Text className="font-serif text-xl text-ink">{r.item}</Text>
                <Text className="mt-1 text-sm text-ash">{r.city} · up to €{r.maxFee} fee</Text>
              </View>
              <TouchableOpacity className="rounded-full border border-ink/15 px-4 py-2">
                <Text className="text-xs text-ink/80">I have this</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>

      <View className="mt-12 items-center">
        <Ionicons name="megaphone-outline" size={40} color="#9A9081" />
        <Text className="mt-3 text-center text-sm text-ash">
          We notify you the moment a matching listing appears in your radius.
        </Text>
      </View>
    </ScrollView>
  );
}
