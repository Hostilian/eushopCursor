import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { Card } from '../src/components/Card';

/**
 * Mobile read of the manifesto. Mirrors `apps/web/src/app/(marketing)/manifesto/page.tsx`
 * with shorter line lengths and tap targets sized for thumbs. The text is a
 * literal copy so press, investors, and partners read the same words on every
 * surface.
 */
export default function ManifestoScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Manifesto' }} />
      <ScrollView
        className="bg-paper flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
      >
        <Text className="text-ash text-xs tracking-widest uppercase">Eushop manifesto</Text>
        <Text className="text-ink mt-2 font-serif text-3xl leading-tight">
          A map for what people already do.
        </Text>
        <Text className="text-ink/70 mt-3 text-base leading-relaxed">
          People in the diaspora carry things home for each other every week. Aunts, students,
          freelancers — all moving small parcels across borders. Eushop just gives the meeting
          place: trips, locals, and open asks.
        </Text>

        <View className="mt-8 gap-4">
          <Card>
            <Text className="text-saffron-700 font-serif text-lg">One map.</Text>
            <Text className="text-ink/80 mt-2 text-sm leading-relaxed">
              Trips, listings, and requests share a single discovery surface. You see who is flying,
              who is selling, and who is asking — without bouncing between apps.
            </Text>
          </Card>
          <Card>
            <Text className="text-saffron-700 font-serif text-lg">A small fee, never a tax.</Text>
            <Text className="text-ink/80 mt-2 text-sm leading-relaxed">
              We add a tiny platform fee on confirmed reservations so we can run the lights.
              Everything else stays between you and the traveller. The deal is yours.
            </Text>
          </Card>
          <Card>
            <Text className="text-saffron-700 font-serif text-lg">
              5 km cells, never your address.
            </Text>
            <Text className="text-ink/80 mt-2 text-sm leading-relaxed">
              We never reveal your address. Pins live inside a 5 km cell so coffee handoffs stay
              practical and your home stays private.
            </Text>
          </Card>
          <Card>
            <Text className="text-saffron-700 font-serif text-lg">Built for trust.</Text>
            <Text className="text-ink/80 mt-2 text-sm leading-relaxed">
              Verified bringers, public handoff protocol, optional KYC for higher-value trips. Lots
              of small signals so you can decide who to meet.
            </Text>
          </Card>
        </View>
      </ScrollView>
    </>
  );
}
