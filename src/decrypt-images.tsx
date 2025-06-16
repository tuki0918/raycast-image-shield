import { PopToRootType, showHUD } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import PasswordForm from "./components/PasswordForm";
import GridLoadingView from "./components/GridLoadingView";
import GridRestoredImages from "./components/GridRestoredImages";
import { useDecryptImages } from "./hooks/useDecryptImages";
import DecryptImagesFrom from "./components/DecryptImagesFrom";
import { generateFragmentFileName } from "image-shield/dist/utils/helpers";
import { writeRestoredImage } from "./utils/helpers";

export default function Command() {
  const { isLoading, isInstantCall, data, selectedFiles, initialize, handleDecrypt } = useDecryptImages();

  // Initialize (if command is called with selected items from Finder)
  const { isLoading: isInitializing } = usePromise(async () => await initialize(), []);

  // Loading or initializing
  if (isLoading || isInitializing) {
    return <GridLoadingView title="Loading..." />;
  }

  // Password form
  if (selectedFiles.manifest?.secure && !data) {
    return (
      <PasswordForm
        onSubmit={(secretKey) =>
          handleDecrypt(selectedFiles.manifest, selectedFiles.imagePaths, selectedFiles.workdir, secretKey)
        }
      />
    );
  }

  // No GUI for restored images
  if (isInstantCall && data) {
    const { manifest, imageBuffers, workdir } = data;
    const { prefix } = manifest.config;
    const total = imageBuffers.length;
    (async () => {
      imageBuffers.forEach(async (imageBuffer, i) => {
        const fileName = generateFragmentFileName(prefix, i, total);
        await writeRestoredImage(manifest, imageBuffer, fileName, workdir);
      });
      await showHUD("🎉 All images decrypted successfully!", {
        clearRootSearch: true,
        popToRootType: PopToRootType.Immediate,
      });
    })();
    return;
  }

  // Restored images grid
  if (data) {
    return <GridRestoredImages manifest={data.manifest} imageBuffers={data.imageBuffers} workdir={data.workdir} />;
  }

  // Default form view
  return <DecryptImagesFrom />;
}
