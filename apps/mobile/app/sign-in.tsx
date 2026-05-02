import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { apiUrl } from '../src/lib/trpc';

export default function SignInScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    setPending(true);
    try {
      const res = await fetch(`${apiUrl}/api/auth/magic-link/sign-in`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, callbackURL: 'eushop://profile' }),
      });
      if (!res.ok) throw new Error('Could not send link');
      setSent(true);
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <View className="flex-1 justify-center bg-paper p-8">
      <Text className="font-serif text-4xl text-ink">Sign in</Text>
      <Text className="mt-2 text-sm text-ash">A magic link, no passwords.</Text>

      {sent ? (
        <View className="mt-12 rounded-3xl border border-ink/10 bg-porcelain p-8">
          <Text className="font-serif text-2xl text-ink">Check your inbox</Text>
          <Text className="mt-2 text-sm text-ash">A link is on its way to {email}.</Text>
          <TouchableOpacity className="mt-6 rounded-full border border-ink/10 px-5 py-3" onPress={() => router.back()}>
            <Text className="text-center text-ink">Done</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="mt-12" style={{ gap: 16 }}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.eu"
            placeholderTextColor="#9A9081"
            keyboardType="email-address"
            autoCapitalize="none"
            className="rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-ink"
          />
          <TouchableOpacity className="rounded-full bg-ink py-4" onPress={submit} disabled={pending}>
            <Text className="text-center text-paper font-medium">
              {pending ? 'Sending…' : 'Send magic link'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
