import { Form, Action, ActionPanel, Toast, showToast } from "@raycast/api";
import GridLoadingView from "./GridLoadingView";
import GridRestoredImages from "./GridRestoredImages";
import PasswordForm from "./PasswordForm";
import { useDecryptImages } from "../hooks/useDecryptImages";

function DecryptImagesFrom() {
  const { isLoading, error, data, selectedManifest, selectedImagePaths, selectedWorkdir, handleDecrypt, handleSubmit } =
    useDecryptImages();

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

  // Default view
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Decrypt" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description title="How to use" text={"Please select the manifest file and the encrypted images."} />
      <Form.FilePicker id="folders" allowMultipleSelection={true} canChooseFiles={true} />
    </Form>
  );
}

export default DecryptImagesFrom;
