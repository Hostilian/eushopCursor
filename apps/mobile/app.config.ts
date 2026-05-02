import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic Expo config. `eas init` / `eas build` normally writes `expo.extra.eas.projectId`
 * into app.json; CI may set `EAS_PROJECT_ID` instead.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const baseExtra = (config.extra ?? {}) as Record<string, unknown>;
  const baseEas = (baseExtra.eas ?? {}) as Record<string, unknown>;
  const envProjectId = process.env.EAS_PROJECT_ID?.trim();

  return {
    ...config,
    extra: {
      ...baseExtra,
      eas: {
        ...baseEas,
        ...(envProjectId ? { projectId: envProjectId } : {}),
      },
    },
  };
};
