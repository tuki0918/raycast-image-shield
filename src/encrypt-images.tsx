import { PopToRootType, showHUD, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useLocalStorage } from "@raycast/utils";
import EncryptImagesFrom from "./components/EncryptImagesFrom";
import { useEncryptImages } from "./hooks/useEncryptImages";
import GridLoadingView from "./components/GridLoadingView";
import { MANIFEST_FILE_NAME, SETTINGS_KEY } from "./constraints";
import { initialSettings, SettingsFromValues } from "./components/SettingsFrom";
import { generateFragmentFileName } from "image-shield/dist/utils/helpers";
import { writeEncryptedImage, writeManifest } from "./utils/helpers";
import PasswordForm from "./components/PasswordForm";

export default function Command() {
  const { value: settings, isLoading } = useLocalStorage(SETTINGS_KEY, initialSettings);
  // Loading
  if (isLoading || !settings) {
    return <GridLoadingView title="Loading..." />;
  }

  return <EncryptImages settings={settings} />;
}

function EncryptImages({ settings }: { settings: SettingsFromValues }) {
  const { isLoading, isInstantCall, error, data, selectedFiles, initialize, handleEncrypt } =
    useEncryptImages(settings);

  // Initialize (if command is called with selected items from Finder)
  const { isLoading: isInitializing } = usePromise(async () => await initialize(), []);

  // Error toast
  if (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "Encrypting failed.",
      message: error,
    });
  }

  // Loading or initializing
  if (isLoading || isInitializing) {
    return <GridLoadingView title="Loading..." />;
  }

  // Password form
  if (selectedFiles.config?.encrypted && !data) {
    return (
      <PasswordForm
        onSubmit={(secretKey) => handleEncrypt(selectedFiles.imagePaths, selectedFiles.workdir, secretKey)}
      />
    );
  }

  // No GUI for encrypted images
  if (isInstantCall && data) {
    const { manifest, imageBuffers, workdir } = data;
    const { secure } = manifest;
    const { prefix } = manifest.config;
    const total = imageBuffers.length;
    (async () => {
      await writeManifest(manifest, MANIFEST_FILE_NAME, workdir);
      imageBuffers.forEach(async (imageBuffer, i) => {
        const fileName = generateFragmentFileName(prefix, i, total, { isFragmented: true, isEncrypted: secure });
        await writeEncryptedImage(manifest, imageBuffer, fileName, workdir);
      });
      await showHUD("🎉 All images encrypted successfully!", {
        clearRootSearch: true,
        popToRootType: PopToRootType.Immediate,
      });
    })();
    return;
  }

  // Default form view
  return <EncryptImagesFrom settings={settings} />;
}
