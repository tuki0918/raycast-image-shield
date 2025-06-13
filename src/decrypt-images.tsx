import { Detail, showToast, Toast } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import PasswordForm from "./components/PasswordForm";
import GridLoadingView from "./components/GridLoadingView";
import GridRestoredImages from "./components/GridRestoredImages";
import { useDecryptImages } from "./hooks/useDecryptImages";

export default function Command() {
  const { isLoading, error, data, selectedManifest, selectedImagePaths, secretKey, initialize, handleDecrypt } =
    useDecryptImages();

  // Initialize
  usePromise(async () => await initialize(), []);

  // Error toast
  if (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "decrypting failed",
      message: error,
    });
  }

  // Loading
  if (isLoading) {
    return <GridLoadingView title="decrypting..." />;
  }

  // Password form
  if (selectedManifest?.secure && !secretKey) {
    return <PasswordForm onSubmit={(secretKey) => handleDecrypt(selectedManifest, selectedImagePaths, secretKey)} />;
  }

  // Restored images grid
  if (data) {
    return <GridRestoredImages manifest={data.manifest} imageBuffers={data.imageBuffers} />;
  }

  // Default view
  return <Detail markdown="please select images" />;
}
