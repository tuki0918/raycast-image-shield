import { useState, useCallback } from "react";
import { getSelectedFinderItems } from "@raycast/api";
import { type ManifestData } from "image-shield";
import { findManifestAndImages } from "../utils/helpers";
import { readManifest, restoreImagesWithKey, validateDecryptFiles } from "../lib/imageShield";
import { dirname } from "node:path";

interface UseDecryptImagesResult {
  isLoading: boolean;
  error?: string;
  data?: { manifest: ManifestData; imageBuffers: Buffer[]; workdir: string | undefined };
  selectedManifest?: ManifestData;
  selectedImagePaths?: string[];
  selectedWorkdir?: string;
  initialize: () => Promise<void>;
  handleDecrypt: (
    manifestArg?: ManifestData,
    imagePathsArg?: string[],
    workdirArg?: string,
    secretKey?: string,
  ) => Promise<void>;
  setError: (err: string | undefined) => void;
  handleSubmit: (values: { folders: string[] }) => Promise<void>;
}

export function useDecryptImages(): UseDecryptImagesResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [data, setData] = useState<
    { manifest: ManifestData; imageBuffers: Buffer[]; workdir: string | undefined } | undefined
  >();
  const [selectedWorkdir, setSelectedWorkdir] = useState<string | undefined>();
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

      const filePaths = (await getSelectedFinderItems()).map((f) => f.path);
      if (filePaths.length === 0) {
        setIsLoading(false);
        return;
      }

      const { manifestPath, imagePaths } = findManifestAndImages(filePaths);
      const manifest = await readManifest(manifestPath);
      const workdir = dirname(manifestPath);

      // If not secure, try to decrypt immediately
      if (!manifest.secure) {
        await handleDecrypt(manifest, imagePaths, workdir, undefined);
      }

      setSelectedWorkdir(workdir);
      setSelectedManifest(manifest);
      setSelectedImagePaths(imagePaths);
      setIsLoading(false);
    } catch (e) {
      handleError(e);
    }
  };

  // Form submit handler
  async function handleSubmit(values: { folders: string[] }) {
    try {
      setIsLoading(true);
      setError(undefined);
      const { folders } = values;
      const { manifestPath, imagePaths } = findManifestAndImages(folders);
      const manifest = await readManifest(manifestPath);
      const workdir = dirname(manifestPath);

      // If not secure, try to decrypt immediately
      if (!manifest.secure) {
        await handleDecrypt(manifest, imagePaths, workdir, undefined);
      }

      setSelectedWorkdir(workdir);
      setSelectedManifest(manifest);
      setSelectedImagePaths(imagePaths);
      setIsLoading(false);
    } catch (e) {
      handleError(e);
    }
  }

  // Decrypt handler
  const handleDecrypt = useCallback(
    async (manifestArg?: ManifestData, imagePathsArg?: string[], workdirArg?: string, secretKey?: string) => {
      setIsLoading(true);
      setError(undefined);
      try {
        const manifest = manifestArg || selectedManifest;
        const imagePaths = imagePathsArg || selectedImagePaths;
        const workdir = workdirArg || selectedWorkdir;
        const validated = validateDecryptFiles(manifest, imagePaths, secretKey);
        const imageBuffers = await restoreImagesWithKey(validated.imagePaths, validated.manifest, validated.secretKey);
        setData({ manifest: validated.manifest, imageBuffers, workdir });
        setIsLoading(false);
      } catch (e) {
        handleError(e);
      }
    },
    [selectedManifest, selectedImagePaths, selectedWorkdir],
  );

  return {
    isLoading,
    error,
    data,
    selectedManifest,
    selectedImagePaths,
    selectedWorkdir,
    initialize,
    handleDecrypt,
    setError,
    handleSubmit,
  };
}
