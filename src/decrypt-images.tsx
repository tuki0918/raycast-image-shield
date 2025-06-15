import { showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import PasswordForm from "./components/PasswordForm";
import GridLoadingView from "./components/GridLoadingView";
import GridRestoredImages from "./components/GridRestoredImages";
import { useDecryptImages } from "./hooks/useDecryptImages";
import DecryptImagesFrom from "./components/DecryptImagesFrom";

export default function Command() {
  const { isLoading, error, data, selectedManifest, selectedImagePaths, selectedWorkdir, initialize, handleDecrypt } =
    useDecryptImages();

  // Initialize (if command is called with selected items from Finder)
  const { isLoading: isInitializing } = usePromise(async () => await initialize(), []);

  // Error toast
  if (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "decrypting failed",
      message: error,
    });
  }

  // Loading or initializing
  if (isLoading || isInitializing) {
    return <GridLoadingView title="Loading..." />;
  }

  // Password form
  if (selectedManifest?.secure && !data) {
    return (
      <PasswordForm
        onSubmit={(secretKey) => handleDecrypt(selectedManifest, selectedImagePaths, selectedWorkdir, secretKey)}
      />
    );
  }

  // Restored images grid
  if (data) {
    return <GridRestoredImages manifest={data.manifest} imageBuffers={data.imageBuffers} workdir={data.workdir} />;
  }

  // Default form view
  return <DecryptImagesFrom />;
}
