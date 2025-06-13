import { useState, useCallback } from "react";
import { ImageRestorer, type ManifestData } from "image-shield";
import { verifySecretKey } from "image-shield/dist/utils/helpers";
import { readJsonFile } from "image-shield/dist/utils/file";
import { getSelectedFinderTargetItems } from "../utils/helpers";

interface UseDecryptImagesResult {
  isLoading: boolean;
  error?: string;
  data?: { manifest: ManifestData; imageBuffers: Buffer[] };
  selectedManifest?: ManifestData;
  selectedImagePaths?: string[];
  secretKey?: string;
  initialize: () => Promise<void>;
  handleDecrypt: (manifestArg?: ManifestData, imagePathsArg?: string[], secretKey?: string) => Promise<void>;
  setSecretKey: (key: string | undefined) => void;
  setError: (err: string | undefined) => void;
}

export function useDecryptImages(): UseDecryptImagesResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [data, setData] = useState<{ manifest: ManifestData; imageBuffers: Buffer[] } | undefined>();
  const [selectedManifest, setSelectedManifest] = useState<ManifestData | undefined>();
  const [selectedImagePaths, setSelectedImagePaths] = useState<string[] | undefined>();
  const [secretKey, setSecretKey] = useState<string | undefined>();

  // Error handler
  const handleError = (e: unknown) => {
    setError(String(e));
    setIsLoading(false);
  };

  // Validation logic for decryption parameters
  const validateDecryptParams = (manifest?: ManifestData, imagePaths?: string[], secretKey?: string) => {
    if (!manifest) throw new Error("manifest is required");
    if (manifest.secure && !secretKey) throw new Error("secret key is required");
    if (!imagePaths || imagePaths.length === 0) throw new Error("image paths are required");
  };

  // Initialization logic
  const initialize = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const { manifestPath, imagePaths } = await getSelectedFinderTargetItems();
      const manifest = await readJsonFile<ManifestData>(manifestPath);
      // If not secure, try to decrypt immediately
      if (!manifest.secure) {
        await handleDecrypt(manifest, imagePaths, undefined);
      }
      setSelectedManifest(manifest);
      setSelectedImagePaths(imagePaths);
      setIsLoading(false);
    } catch (e) {
      handleError(e);
    }
  };

  // Decrypt handler
  const handleDecrypt = useCallback(
    async (manifestArg?: ManifestData, imagePathsArg?: string[], secretKey?: string) => {
      setIsLoading(true);
      setError(undefined);
      try {
        const manifest = manifestArg || selectedManifest;
        const imagePaths = imagePathsArg || selectedImagePaths;
        validateDecryptParams(manifest, imagePaths, secretKey);
        const restorer = new ImageRestorer(verifySecretKey(secretKey));
        const imageBuffers = await restorer.restoreImages(imagePaths!, manifest!);
        setData({ manifest: manifest!, imageBuffers });
        setSecretKey(secretKey);
        setIsLoading(false);
      } catch (e) {
        handleError(e);
      }
    },
    [selectedManifest, selectedImagePaths],
  );

  return {
    isLoading,
    error,
    data,
    selectedManifest,
    selectedImagePaths,
    secretKey,
    initialize,
    handleDecrypt,
    setSecretKey,
    setError,
  };
}
