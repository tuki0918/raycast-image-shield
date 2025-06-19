import { PopToRootType, showHUD } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useEffect } from "react";
import EncryptImagesFrom from "./components/EncryptImagesFrom";
import { useEncryptImages } from "./hooks/useEncryptImages";
import GridLoadingView from "./components/GridLoadingView";
import { MANIFEST_FILE_NAME } from "./constraints";
import { SettingsFromValues } from "./components/SettingsFrom";
import { generateFragmentFileName } from "image-shield/dist/utils/helpers";
import { writeEncryptedImage, writeManifest } from "./utils/helpers";
import PasswordForm from "./components/PasswordForm";
import { useSettings } from "./hooks/useSettings";

export default function Command() {
  const { settings, isLoading } = useSettings();
  // Loading
  if (isLoading || !settings) {
    return <GridLoadingView title="Loading..." />;
  }

  return <EncryptImages settings={settings} />;
}

function EncryptImages({ settings }: { settings: SettingsFromValues }) {
  const { isLoading, isInstantCall, data, selectedFiles, initialize, handleEncrypt } = useEncryptImages(settings);

  // Initialize (if command is called with selected items from Finder)
  const { isLoading: isInitializing } = usePromise(async () => await initialize(), []);

  // Handle instant call for encrypted images
  useEffect(() => {
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
    }
  }, [isInstantCall, data]);

  // Loading or initializing
  if (isLoading || isInitializing) {
    return <GridLoadingView title="Loading..." />;
  }

  // No GUI for encrypted images - show loading while processing
  if (isInstantCall && data) {
    return <GridLoadingView title="Encrypting images..." />;
  }

  // Password form
  if (selectedFiles.config?.encrypted && !data) {
    return (
      <PasswordForm
        actionTitle="Encrypt"
        onSubmit={(secretKey) => handleEncrypt(selectedFiles.imagePaths, selectedFiles.workdir, secretKey)}
      />
    );
  }

  // Default form view
  return <EncryptImagesFrom settings={settings} />;
}
