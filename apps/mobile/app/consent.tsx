import { COUNTRIES } from '@eushop/catalog';
import { useRouter } from 'expo-router';
import { getLocales } from 'expo-localization';
import { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getCountryLegalFramework } from '../src/lib/legal-frameworks';
import { getConsent, saveConsent } from '../src/lib/observability';

/**
 * On-launch privacy / consent screen.
 *
 * Shown once per install (gated on `eushop.consent.v1` AsyncStorage entry).
 * Mirrors the EU "reject all" parity of the web consent banner: necessary
 * cookies are always on (auth, crash reports), analytics and marketing
 * default OFF and require an explicit toggle.
 */
export default function ConsentScreen() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [pending, setPending] = useState(false);
  const localeRegion = useMemo(() => getLocales()[0]?.regionCode?.toUpperCase() ?? null, []);
  const [selectedIso2, setSelectedIso2] = useState<string | null>(localeRegion);
  const legal = useMemo(() => {
    if (!selectedIso2) return null;
    return getCountryLegalFramework(selectedIso2);
  }, [selectedIso2]);
  const countryOptions = useMemo(
    () =>
      COUNTRIES.slice()
        .sort((a, b) => a.name.localeCompare(b.name, 'en'))
        .map((country) => ({
          iso2: country.iso2,
          label: `${country.flagEmoji} ${country.iso2}`,
        })),
    [],
  );
  const autoDetectedLegal = useMemo(() => {
    if (!localeRegion) return null;
    const regionGuess = getLocales()[0]?.regionCode;
    if (!regionGuess) return null;
    return getCountryLegalFramework(regionGuess);
  }, []);

  useEffect(() => {
    void (async () => {
      const stored = await getConsent();
      if (stored?.legalCountryIso2) {
        setSelectedIso2(stored.legalCountryIso2);
      }
    })();
  }, []);

  const accept = async (override?: { analytics?: boolean; marketing?: boolean }) => {
    setPending(true);
    try {
      await saveConsent({
        analytics: override?.analytics ?? analytics,
        marketing: override?.marketing ?? marketing,
        legalCountryIso2: selectedIso2 ?? localeRegion ?? undefined,
      });
      router.replace('/');
    } finally {
      setPending(false);
    }
  };

  return (
    <ScrollView
      className="bg-paper flex-1"
      contentContainerStyle={{ padding: 24, paddingBottom: 64 }}
    >
      <Text className="text-ash text-xs tracking-widest uppercase">Privacy first</Text>
      <Text className="text-ink mt-2 font-serif text-3xl leading-tight">Your data, your call.</Text>
      <Text className="text-ink/70 mt-3 text-base leading-relaxed">
        Eushop applies country-specific legal frameworks. The only data we always need is what keeps
        the app working: your account, your messages, and crash reports so we can fix bugs.
        Everything else is opt-in.
      </Text>
      <Text className="text-ash mt-4 text-xs tracking-widest uppercase">
        Select country framework
      </Text>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {countryOptions.map((country) => {
          const active = selectedIso2 === country.iso2;
          return (
            <TouchableOpacity
              key={country.iso2}
              className={`rounded-full border px-3 py-1 ${
                active ? 'border-ink bg-ink' : 'border-ink/20 bg-white'
              }`}
              onPress={() => setSelectedIso2(country.iso2)}
            >
              <Text className={`text-xs ${active ? 'text-paper' : 'text-ink/70'}`}>
                {country.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {legal ? (
        <View className="border-ink/10 mt-5 rounded-2xl border bg-white p-5">
          <Text className="text-ash text-xs tracking-widest uppercase">
            {legal.countryName} ({legal.iso2})
          </Text>
          <Text className="text-ink mt-2 text-sm">Privacy: {legal.privacyFramework}</Text>
          <Text className="text-ink mt-1 text-sm">Commerce: {legal.commerceFramework}</Text>
          <Text className="text-ink mt-1 text-sm">Food transfer: {legal.foodSafetyFramework}</Text>
          <TouchableOpacity
            className="mt-3"
            onPress={() => {
              void Linking.openURL(legal.authorityUrl);
            }}
          >
            <Text className="text-ink text-sm underline">{legal.authorityName}</Text>
          </TouchableOpacity>
          <Text className="text-ink/70 mt-2 text-xs">{legal.note}</Text>
        </View>
      ) : null}
      {autoDetectedLegal && autoDetectedLegal.iso2 !== selectedIso2 ? (
        <Text className="text-ash mt-2 text-xs">
          Auto-detected country: {autoDetectedLegal.countryName} ({autoDetectedLegal.iso2}).
        </Text>
      ) : null}

      <View className="mt-8 gap-4">
        <View className="border-ink/10 rounded-2xl border bg-white p-5">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-ink font-serif text-lg">Necessary</Text>
              <Text className="text-ink/70 mt-1 text-sm">
                Sign-in, message delivery, push tokens, crash reports. Cannot be turned off.
              </Text>
            </View>
            <Switch value disabled />
          </View>
        </View>

        <View className="border-ink/10 rounded-2xl border bg-white p-5">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-ink font-serif text-lg">Analytics</Text>
              <Text className="text-ink/70 mt-1 text-sm">
                Anonymous usage stats so we know which screens to fix. EU-hosted PostHog. No
                third-party tracking.
              </Text>
            </View>
            <Switch value={analytics} onValueChange={setAnalytics} />
          </View>
        </View>

        <View className="border-ink/10 rounded-2xl border bg-white p-5">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
              <Text className="text-ink font-serif text-lg">Marketing</Text>
              <Text className="text-ink/70 mt-1 text-sm">
                Occasional product emails. We never share your address.
              </Text>
            </View>
            <Switch value={marketing} onValueChange={setMarketing} />
          </View>
        </View>
      </View>

      <View className="mt-8 gap-3">
        <TouchableOpacity
          className="bg-ink rounded-full py-4"
          disabled={pending}
          onPress={() => accept()}
        >
          <Text className="text-paper text-center font-medium">
            {pending ? 'Saving…' : 'Save my choices'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="border-ink/15 rounded-full border py-4"
          disabled={pending}
          onPress={() => accept({ analytics: false, marketing: false })}
        >
          <Text className="text-ink text-center font-medium">Reject optional</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-ash mt-6 text-center text-xs">
        You can change these anytime in Profile → Privacy.
      </Text>
    </ScrollView>
  );
}
