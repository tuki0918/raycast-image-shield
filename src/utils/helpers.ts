import { MANIFEST_FILE_NAME } from "../constraints";

export function bufferToDataUrl(buffer: Buffer, mimeType = "image/png") {
  const base64 = buffer.toString("base64");
  return `data:${mimeType};base64,${base64}`;
}

export function findManifestAndImages(filePaths: string[]) {
  const manifestPath = filePaths.find((path: string) => path.endsWith(MANIFEST_FILE_NAME));
  const imagePaths = filePaths.filter((path: string) => path !== manifestPath).sort();

  if (!manifestPath) {
    throw new Error(`${MANIFEST_FILE_NAME} not found`);
  }

  if (imagePaths.length === 0) {
    throw new Error("fragment images not found");
  }

  return {
    manifestPath,
    imagePaths,
  };
}
