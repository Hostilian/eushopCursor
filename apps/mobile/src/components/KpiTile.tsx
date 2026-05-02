import { Text, View } from 'react-native';

export function KpiTile({ label, value }: { label: string; value: string | number }) {
  return (
    <View className="border-ink/10 bg-paper min-w-[88px] flex-1 rounded-2xl border px-3 py-3">
      <Text className="text-ink text-center font-serif text-2xl">{value}</Text>
      <Text className="text-ash mt-1 text-center text-[10px] tracking-widest uppercase">
        {label}
      </Text>
    </View>
  );
}
