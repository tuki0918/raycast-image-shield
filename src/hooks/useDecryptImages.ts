import { useState, useCallback } from "react";
import { type ManifestData } from "image-shield";
import { findManifestAndImages, getSelectedFinderTargetItems } from "../utils/helpers";
import { readManifest, restoreImagesWithKey, validateDecryptFiles } from "../lib/imageShield";

interface UseDecryptImagesResult {
  isLoading: boolean;
  error?: string;
  data?: { manifest: ManifestData; imageBuffers: Buffer[] };
  selectedManifest?: ManifestData;
  selectedImagePaths?: string[];
  initialize: () => Promise<void>;
  handleDecrypt: (manifestArg?: ManifestData, imagePathsArg?: string[], secretKey?: string) => Promise<void>;
  setError: (err: string | undefined) => void;
  handleSubmit: (values: { folders: string[] }) => Promise<void>;
}

export function useDecryptImages(): UseDecryptImagesResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [data, setData] = useState<{ manifest: ManifestData; imageBuffers: Buffer[] } | undefined>();
  const [selectedManifest, setSelectedManifest] = useState<ManifestData | undefined>();
  const [selectedImagePaths, setSelectedImagePaths] = useState<string[] | undefined>();

  // Error handler
  const handleError = (e: unknown) => {
    setError(String(e));
    setIsLoading(false);
  };

  // Initialization logic
  const initialize = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const { manifestPath, imagePaths } = await getSelectedFinderTargetItems();
      const manifest = await readManifest(manifestPath);
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

  async function handleSubmit(values: { folders: string[] }) {
    try {
      setIsLoading(true);
      setError(undefined);
      const { folders } = values;
      const { manifestPath, imagePaths } = findManifestAndImages(folders);
      const manifest = await readManifest(manifestPath);
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
  }

  // Decrypt handler
  const handleDecrypt = useCallback(
    async (manifestArg?: ManifestData, imagePathsArg?: string[], secretKey?: string) => {
      setIsLoading(true);
      setError(undefined);
      try {
        const manifest = manifestArg || selectedManifest;
        const imagePaths = imagePathsArg || selectedImagePaths;
        const validated = validateDecryptFiles(manifest, imagePaths, secretKey);
        const imageBuffers = await restoreImagesWithKey(validated.imagePaths, validated.manifest, validated.secretKey);
        setData({ manifest: validated.manifest, imageBuffers });
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
    initialize,
    handleDecrypt,
    setError,
    handleSubmit,
  };
}
