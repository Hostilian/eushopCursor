import { Link } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Card } from '../src/components/Card';

const STEPS = [
  {
    title: 'Discover',
    body: 'Browse countries and listings in your radius — pins stay inside a 5 km cell.',
  },
  {
    title: 'Share',
    body: 'Post what you brought back from home. Set a small finder\u2019s fee and meet in public.',
  },
  {
    title: 'Meet',
    body: 'Message in-app, agree on a café or station, settle in person. We never touch the cash.',
  },
];

export default function OnboardingScreen() {
  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
    >
      <Text className="text-ash text-xs tracking-widest uppercase">Eushop</Text>
      <Text className="text-ink mt-2 font-serif text-4xl leading-tight">Three beats.</Text>
      <Text className="text-ink/70 mt-3 text-base">
        The same story on web, admin, and here — tuned for thumbs.
      </Text>
      <View className="mt-8 gap-4">
        {STEPS.map((s) => (
          <Card key={s.title}>
            <Text className="text-saffron-700 font-serif text-xl">{s.title}</Text>
            <Text className="text-ink/80 mt-2 text-sm leading-relaxed">{s.body}</Text>
          </Card>
        ))}
      </View>
      <Link href="/" asChild>
        <Text className="text-saffron-700 mt-10 text-center text-base font-semibold">
          Enter the app →
        </Text>
      </Link>
    </ScrollView>
  );
}
