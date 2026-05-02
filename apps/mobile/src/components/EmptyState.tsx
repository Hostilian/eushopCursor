import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export function EmptyState({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <View className="items-center justify-center px-8 py-12">
      <Text className="text-ink text-center font-serif text-xl">{title}</Text>
      {hint ? <Text className="text-ash mt-2 text-center text-sm">{hint}</Text> : null}
    </View>
  );
}
