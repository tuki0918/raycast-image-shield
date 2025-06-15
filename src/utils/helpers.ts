import { MANIFEST_FILE_NAME } from "../constraints";
import { homedir } from "node:os";
import { createDirIfNotExists, writeFile, exists } from "./file";
import { dirname, join } from "node:path";
import { ManifestData } from "image-shield";

export function bufferToDataUrl(buffer: Buffer, mimeType = "image/png") {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

export async function findManifestAndImages(filePaths: string[]) {
  const manifestPath = filePaths.find((path: string) => path.endsWith(MANIFEST_FILE_NAME));
  const imagePaths = filePaths.filter((path: string) => path !== manifestPath).sort();

  if (!manifestPath) {
    throw new Error(`${MANIFEST_FILE_NAME} is required`);
  }

  if (imagePaths.length === 0) {
    throw new Error("Target image files are required");
  }

  for (const filePath of filePaths) {
    if (!(await exists(filePath))) {
      throw new Error(`File "${filePath}" does not exist`);
    }
  }

  const workdir = dirname(manifestPath);

  return {
    manifestPath,
    imagePaths,
    workdir,
  };
}

export async function writeRestoredImage(
  manifest: ManifestData,
  imageBuffer: Buffer,
  fileName: string,
  basePath?: string,
) {
  const dir = basePath ? join(basePath, "restored") : join(homedir(), "Downloads", manifest.id);
  await createDirIfNotExists(dir);
  await writeFile(dir, fileName, imageBuffer);
}
