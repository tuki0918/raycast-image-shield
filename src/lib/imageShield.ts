import { ImageRestorer, type ManifestData } from "image-shield";
import { readJsonFile } from "image-shield/dist/utils/file";
import { verifySecretKey } from "image-shield/dist/utils/helpers";
import { MANIFEST_FILE_NAME } from "../constraints";

export async function readManifest(manifestPath: string) {
  return await readJsonFile<ManifestData>(manifestPath);
}

export function validateDecryptFiles(manifest?: ManifestData, imagePaths?: string[], secretKey?: string) {
  if (!manifest) throw new Error(`${MANIFEST_FILE_NAME} is required`);
  if (manifest.secure && !secretKey) throw new Error("Password is required to decrypt the encrypted images");
  if (!imagePaths || imagePaths.length === 0) throw new Error("Target image files are required");
  if (manifest.images.length !== imagePaths.length)
    throw new Error(`Number of image files does not match: ${imagePaths.length} / ${manifest.images.length}`);
  return { manifest, imagePaths, secretKey };
}

export async function restoreImagesWithKey(imagePaths: string[], manifest: ManifestData, secretKey?: string) {
  const restorer = new ImageRestorer(verifySecretKey(secretKey));
  return await restorer.restoreImages(imagePaths, manifest);
}
