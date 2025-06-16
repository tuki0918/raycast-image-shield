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
  const { prefix } = manifest.config;
  const total = imageBuffers.length;
  return (
    <Grid filtering={false} searchText="Encrypted Images" onSearchTextChange={() => {}}>
      <Grid.Item
        content={JSON.stringify(manifest, null, 2)}
        title={MANIFEST_FILE_NAME}
        actions={
          <ActionPanel>
            <DownloadManifestAction manifest={manifest} workdir={workdir} />
            <DownloadAllImagesAction manifest={manifest} imageBuffers={imageBuffers} workdir={workdir} />
          </ActionPanel>
        }
      />
      {imageBuffers.map((imageBuffer, i) => {
        const fileName = generateFragmentFileName(prefix, i, total, { isFragmented: false, isEncrypted: secure });
        return (
          <Grid.Item
            key={i}
            content={bufferToDataUrl(imageBuffer)}
            title={fileName}
            actions={
              <ActionPanel>
                <DownloadImageAction
                  manifest={manifest}
                  imageBuffer={imageBuffer}
                  fileName={fileName}
                  workdir={workdir}
                />
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

function DownloadManifestAction({ manifest, workdir }: { manifest: ManifestData; workdir?: string }) {
  return (
    <Action
      title="Download"
      icon={{ source: Icon.Download }}
      onAction={async () => {
        await writeManifest(manifest, MANIFEST_FILE_NAME, workdir);
        await showToast({
          title: "Downloaded",
          message: "Manifest downloaded successfully.",
          style: Toast.Style.Success,
        });
      }}
    />
  );
}

function DownloadImageAction({
  manifest,
  imageBuffer,
  fileName,
  workdir,
}: {
  manifest: ManifestData;
  imageBuffer: Buffer;
  fileName: string;
  workdir?: string;
}) {
  return (
    <Action
      title="Download"
      icon={{ source: Icon.Download }}
      onAction={async () => {
        await writeEncryptedImages(manifest, imageBuffer, fileName, workdir);
        await showToast({
          title: "Downloaded",
          message: "Image downloaded successfully.",
          style: Toast.Style.Success,
        });
      }}
    />
  );
}

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
