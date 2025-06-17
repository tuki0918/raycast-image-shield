import { ActionPanel, Grid } from "@raycast/api";
import { generateFragmentFileName, generateRestoredOriginalFileName } from "image-shield/dist/utils/helpers";
import type { ManifestData } from "image-shield";
import { bufferToDataUrl } from "../utils/helpers";
import { DownloadAllImagesAction, DownloadImageAction } from "./DownloadAction";

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
        const imageInfo = manifest.images[i];
        const fileName = generateRestoredOriginalFileName(imageInfo) ?? generateFragmentFileName(prefix, i, total);
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
                  imageBuffers={imageBuffers}
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
