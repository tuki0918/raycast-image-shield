import { Action, ActionPanel, Grid, Icon, showToast, Toast } from "@raycast/api";
import { generateFragmentFileName } from "image-shield/dist/utils/helpers";
import type { ManifestData } from "image-shield";
import { bufferToDataUrl, writeRestoredImage } from "../utils/helpers";

interface GridRestoredImagesProps {
  manifest: ManifestData;
  imageBuffers: Buffer[];
  workdir?: string;
}

function GridRestoredImages({ manifest, imageBuffers, workdir }: GridRestoredImagesProps) {
  const { prefix } = manifest.config;
  const total = imageBuffers.length;
  return (
    <Grid filtering={false} searchText="Restored Images" onSearchTextChange={() => {}}>
      {imageBuffers.map((imageBuffer, i) => {
        const fileName = generateFragmentFileName(prefix, i, total);
        const imageInfo = manifest.images[i];
        const { w, h } = imageInfo;
        const subtitle = w && h ? `${w} x ${h}` : "";
        return (
          <Grid.Item
            key={i}
            content={bufferToDataUrl(imageBuffer)}
            title={fileName}
            subtitle={subtitle}
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

export default GridRestoredImages;

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
        await writeRestoredImage(manifest, imageBuffer, fileName, workdir);
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
  const { prefix } = manifest.config;
  const total = imageBuffers.length;
  return (
    <Action
      title="Download All"
      icon={{ source: Icon.Download }}
      onAction={async () => {
        imageBuffers.forEach(async (imageBuffer, i) => {
          const fileName = generateFragmentFileName(prefix, i, total);
          await writeRestoredImage(manifest, imageBuffer, fileName, workdir);
        });
        await showToast({
          title: "Downloaded",
          message: "All images downloaded successfully.",
          style: Toast.Style.Success,
        });
      }}
    />
  );
}
