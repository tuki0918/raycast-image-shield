import { Form, Action, ActionPanel, Toast, showToast } from "@raycast/api";
import { FormValidation, useForm } from "@raycast/utils";
import { SettingsFromValues } from "./SettingsFrom";
import { useEncryptImages } from "../hooks/useEncryptImages";
import GridLoadingView from "./GridLoadingView";
import GridEncryptedImages from "./GridEncryptedImages";
import PasswordForm from "./PasswordForm";

export interface EncryptImagesFromValues {
  folders: string[];
  encrypted: boolean;
  outputDir: string[];
}

function EncryptImagesFrom({ settings }: { settings: SettingsFromValues }) {
  const { isLoading, error, data, selectedFiles, handleEncrypt, handleFormSubmit } = useEncryptImages(settings);

  const { handleSubmit, itemProps } = useForm<EncryptImagesFromValues>({
    initialValues: {
      folders: [],
      encrypted: settings.encrypted,
      outputDir: [],
    },
    onSubmit: handleFormSubmit,
    validation: {
      folders: FormValidation.Required,
      encrypted: FormValidation.Required,
    },
  });

  // Error toast
  if (error) {
    showToast({
      style: Toast.Style.Failure,
      title: "Encrypting failed.",
      message: error,
    });
  }

  // Loading
  if (isLoading) {
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

  // Encrypted images grid
  if (data) {
    return <GridEncryptedImages manifest={data.manifest} imageBuffers={data.imageBuffers} workdir={data.workdir} />;
  }

  // Default view
  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Encrypt" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description title="How to use" text={"Please select the images to encrypt."} />
      <Form.FilePicker
        title="Images"
        allowMultipleSelection={true}
        canChooseFiles={true}
        {...itemProps.folders}
        info="Select images to encrypt."
      />
      <Form.Checkbox
        title="Encryption Type"
        label="Shuffle + Encrypt"
        {...itemProps.encrypted}
        info="If disabled, images are not encrypted, only shuffled. If enabled, images are encrypted and shuffled."
      />
      <Form.FilePicker
        title="Output Directory"
        allowMultipleSelection={false}
        canChooseDirectories={true}
        canChooseFiles={false}
        {...itemProps.outputDir}
        info={`Default: Downloads/{UUID}`}
      />
    </Form>
  );
}

export default EncryptImagesFrom;
