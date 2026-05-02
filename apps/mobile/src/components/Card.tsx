import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

export function Card({
  children,
  className,
  ...rest
}: ViewProps & { children: ReactNode; className?: string }) {
  return (
    <View
      className={`border-ink/10 bg-porcelain rounded-3xl border p-4 ${className ?? ''}`}
      {...rest}
    >
      {children}
    </View>
  );
}
