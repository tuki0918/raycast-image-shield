import { useLocalStorage } from "@raycast/utils";
import SettingsFrom, { initialSettings, SettingsFromValues } from "./components/SettingsFrom";
import GridLoadingView from "./components/GridLoadingView";

export default function Command() {
  const {
    value: settings,
    setValue: setSettings,
    removeValue: reset,
    isLoading,
  } = useLocalStorage<SettingsFromValues>("settings", initialSettings);

  // Loading
  if (isLoading || !settings) {
    return <GridLoadingView title="Loading..." />;
  }

  // Default form view
  return <SettingsFrom settings={settings} setSettings={setSettings} reset={reset} />;
}
