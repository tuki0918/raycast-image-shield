import { Form, Action, ActionPanel, Toast, showToast } from "@raycast/api";
import { findManifestAndImages } from "../utils/helpers";
import { readManifest, restoreImagesWithKey, validateDecryptFiles } from "../lib/imageShield";
import { useState } from "react";
import { type ManifestData } from "image-shield";
import GridLoadingView from "./GridLoadingView";
import GridRestoredImages from "./GridRestoredImages";

interface Values {
  folders: string[];
  password?: string;
}

function DecryptImagesFrom() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [data, setData] = useState<{ manifest: ManifestData; imageBuffers: Buffer[] } | undefined>();

  // Error handler
  const handleError = (e: unknown) => {
    setError(String(e));
    setIsLoading(false);
  };

  async function handleSubmit(values: Values) {
    setIsLoading(true);
    setError(undefined);
    try {
      const { folders, password } = values;
      const { manifestPath, imagePaths } = findManifestAndImages(folders);
      const manifest = await readManifest(manifestPath);
      const validated = validateDecryptFiles(manifest, imagePaths, password);
      const imageBuffers = await restoreImagesWithKey(validated.imagePaths, validated.manifest, validated.secretKey);
      setData({ manifest: validated.manifest, imageBuffers });
      setIsLoading(false);
    } catch (e) {
      handleError(e);
    }
  }

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

  // Restored images grid
  if (data) {
    return <GridRestoredImages manifest={data.manifest} imageBuffers={data.imageBuffers} />;
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
      <Form.Description
        title="How to use"
        text="1. Select the encrypted images.<br />xxx"
        // manifest.json + encrypted images
      />
      <Form.FilePicker id="folders" allowMultipleSelection={true} canChooseFiles={true} />
      <Form.PasswordField id="password" title="Password" placeholder="Enter password" />
    </Form>
  );
}

export default DecryptImagesFrom;
