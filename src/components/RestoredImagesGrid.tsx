import { Grid } from "@raycast/api";
import { generateFragmentFileName } from "image-shield/dist/utils/helpers";
import { bufferToDataUrl } from "../utils/helpers";
import type { ManifestData } from "image-shield";

interface RestoredImagesGridProps {
  manifest: ManifestData;
  imageBuffers: Buffer[];
}

function RestoredImagesGrid({ manifest, imageBuffers }: RestoredImagesGridProps) {
  const { prefix } = manifest.config;
  const total = imageBuffers.length;
  return (
    <Grid filtering={false} searchText="Restored Images" onSearchTextChange={() => {}}>
      {imageBuffers.map((imageBuffer, i) => {
        const fileName = generateFragmentFileName(prefix, i, total);
        const imageInfo = manifest.images[i];
        const { w, h } = imageInfo;
        const subtitle = w && h ? `${w} x ${h}` : "";
        return <Grid.Item key={i} content={bufferToDataUrl(imageBuffer)} title={fileName} subtitle={subtitle} />;
      })}
    </Grid>
  );
}

export default RestoredImagesGrid;
