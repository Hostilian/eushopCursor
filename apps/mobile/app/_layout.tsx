import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../global.css';
import { Providers } from '../src/providers';

export default function RootLayout() {
  return (
    <Providers>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FAF7F2' },
          headerTintColor: '#1A1612',
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: '#FAF7F2' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="country/[iso2]" options={{ title: '' }} />
        <Stack.Screen name="item/[slug]" options={{ title: '' }} />
        <Stack.Screen name="listing/new" options={{ title: 'Share what you brought' }} />
        <Stack.Screen name="request/new" options={{ title: 'Post a request' }} />
        <Stack.Screen name="chat/[id]" options={{ title: 'Conversation' }} />
        <Stack.Screen name="sign-in" options={{ title: 'Sign in', presentation: 'modal' }} />
      </Stack>
    </Providers>
  );
}
