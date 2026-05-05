/**
 * Expo OTA updates helper.
 *
 * On launch we check the configured channel (development / preview / production)
 * for a newer JS bundle. If found, we download it in the background and
 * reload on next foreground. Failures are silent — OTA is best-effort and the
 * user can always continue with the embedded bundle.
 *
 * The runtime version in app.json uses the `appVersion` policy, so OTA only
 * lands on devices running the matching native binary. Native changes still
 * require a store submission.
 */
export async function checkForOtaUpdate(): Promise<void> {
  if (__DEV__) return;
  try {
    const Updates = await import('expo-updates');
    if (!Updates.isEnabled) return;
    const result = await Updates.checkForUpdateAsync();
    if (result.isAvailable) {
      await Updates.fetchUpdateAsync();
      // Reload on next foreground rather than mid-session.
      // Calling reloadAsync now would interrupt the user.
    }
  } catch {
    // Not configured (no EAS_PROJECT_ID) or offline — ignore.
  }
}
