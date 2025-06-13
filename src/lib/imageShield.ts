import { ImageRestorer, type ManifestData } from "image-shield";
import { verifySecretKey } from "image-shield/dist/utils/helpers";

export const validateDecryptFiles = (manifest?: ManifestData, imagePaths?: string[], secretKey?: string) => {
  if (!manifest) throw new Error("manifest is required");
  if (manifest.secure && !secretKey) throw new Error("secret key is required");
  if (!imagePaths || imagePaths.length === 0) throw new Error("image paths are required");
  return { manifest, imagePaths, secretKey };
};

export async function restoreImagesWithKey(imagePaths: string[], manifest: ManifestData, secretKey?: string) {
  const restorer = new ImageRestorer(verifySecretKey(secretKey));
  return await restorer.restoreImages(imagePaths, manifest);
}
