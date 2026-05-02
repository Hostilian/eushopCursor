import type { ReactNode } from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

const styles = StyleSheet.create({
  root: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(26, 22, 18, 0.1)',
    backgroundColor: '#FFFEFB',
    padding: 20,
  },
});

/** Rounded card surface — matches web card rhythm without requiring NativeWind to scan this package. */
export function Surface({ children, style, ...rest }: ViewProps & { children: ReactNode }) {
  return (
    <View style={[styles.root, style]} {...rest}>
      {children}
    </View>
  );
}
