import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Card } from '../../src/components/Card';

/**
 * The handoff protocol — same words on web, admin, and mobile so a buyer who
 * skims it on their phone before a meet sees exactly what was agreed when they
 * signed up. Mirrors `apps/web/src/app/(marketing)/safety/handoff-protocol/page.tsx`.
 */
const STEPS: Array<{ title: string; body: string }> = [
  {
    title: '1. Confirm in-app',
    body: 'Once a traveller confirms your reservation, the slot is yours and we hold the platform fee. You’ll see the trip in your reservations list.',
  },
  {
    title: '2. Agree a public spot',
    body: 'Pick a café, station, or shop entrance — never an apartment. Eushop never reveals exact addresses; the map only shows a 5 km cell.',
  },
  {
    title: '3. Bring photo ID',
    body: 'Both sides bring a recent photo ID. The traveller verifies the buyer; the buyer verifies the traveller. No ID match, no handoff.',
  },
  {
    title: '4. Inspect the goods',
    body: 'Open the packaging together. Check the count, the brand, and that nothing is damaged or expired. Anything off — pause the handoff and message us.',
  },
  {
    title: '5. Settle and confirm',
    body: 'Pay the agreed fee in person, in cash or via your bank app. Both of you mark the reservation as completed in the app — that releases the platform fee.',
  },
  {
    title: '6. Leave a review',
    body: 'A short note about the meet helps the next person decide. Reviews are public and tied to your verified profile.',
  },
];

export default function HandoffProtocolScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Handoff protocol' }} />
      <ScrollView
        className="bg-paper flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
      >
        <Text className="text-ash text-xs tracking-widest uppercase">Safety</Text>
        <Text className="text-ink mt-2 font-serif text-3xl">Handoff protocol.</Text>
        <Text className="text-ink/70 mt-3 text-base leading-relaxed">
          Six small steps that turn a stranger meet into a neighbour favour. Read them once; both of
          you should follow them every time.
        </Text>

        <View className="mt-8 gap-4">
          {STEPS.map((s) => (
            <Card key={s.title} accessibilityLabel={s.title}>
              <Text className="text-saffron-700 font-serif text-lg">{s.title}</Text>
              <Text className="text-ink/80 mt-2 text-sm leading-relaxed">{s.body}</Text>
            </Card>
          ))}
        </View>

        <Text className="text-ink/60 mt-8 text-xs leading-relaxed">
          If anything feels off — wrong package, wrong person, pressure to skip a step — abandon the
          handoff and report it from the trip detail screen. We will follow up.
        </Text>
      </ScrollView>
    </>
  );
}
