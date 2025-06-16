import { Action, ActionPanel, Grid, Icon, showToast, Toast } from "@raycast/api";
import { generateFragmentFileName } from "image-shield/dist/utils/helpers";
import type { ManifestData } from "image-shield";
import { bufferToDataUrl, writeManifest, writeEncryptedImages } from "../utils/helpers";
import { MANIFEST_FILE_NAME } from "../constraints";

interface GridEncryptedImagesProps {
  manifest: ManifestData;
  imageBuffers: Buffer[];
  workdir?: string;
}

function GridEncryptedImages({ manifest, imageBuffers, workdir }: GridEncryptedImagesProps) {
  const { secure } = manifest;
  return (
    <Grid filtering={false} searchText="Encrypted Images" onSearchTextChange={() => {}} inset={Grid.Inset.Small}>
      <Grid.Item
        content={Icon.Document}
        title={MANIFEST_FILE_NAME}
        actions={
          <ActionPanel>
            <DownloadAllImagesAction manifest={manifest} imageBuffers={imageBuffers} workdir={workdir} />
          </ActionPanel>
        }
      />
      {imageBuffers.map((imageBuffer, i) => {
        return (
          <Grid.Item
            key={i}
            content={secure ? Icon.Lock : bufferToDataUrl(imageBuffer)}
            title={`#${i + 1}`}
            actions={
              <ActionPanel>
                <DownloadAllImagesAction manifest={manifest} imageBuffers={imageBuffers} workdir={workdir} />
              </ActionPanel>
            }
          />
        );
      })}
    </Grid>
  );
}

export default GridEncryptedImages;

function DownloadAllImagesAction({
  manifest,
  imageBuffers,
  workdir,
}: {
  manifest: ManifestData;
  imageBuffers: Buffer[];
  workdir?: string;
}) {
  const { secure } = manifest;
  const { prefix } = manifest.config;
  const total = imageBuffers.length;
  return (
    <Action
      title="Download All"
      icon={{ source: Icon.Download }}
      onAction={async () => {
        await writeManifest(manifest, MANIFEST_FILE_NAME, workdir);
        imageBuffers.forEach(async (imageBuffer, i) => {
          const fileName = generateFragmentFileName(prefix, i, total, { isFragmented: true, isEncrypted: secure });
          await writeEncryptedImages(manifest, imageBuffer, fileName, workdir);
        });
        await showToast({
          title: "Downloaded",
          message: "All files downloaded successfully.",
          style: Toast.Style.Success,
        });
      }}
    />
  );
}
