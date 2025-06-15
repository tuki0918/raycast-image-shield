import { useState, useCallback } from "react";
import { getSelectedFinderItems } from "@raycast/api";
import { type ManifestData } from "image-shield";
import { findManifestAndImages } from "../utils/helpers";
import { readManifest, restoreImagesWithKey, validateDecryptFiles } from "../lib/imageShield";

interface SelectedFiles {
  workdir?: string;
  manifest?: ManifestData;
  imagePaths?: string[];
}

interface UseDecryptImagesResult {
  isLoading: boolean;
  error?: string;
  data?: { manifest: ManifestData; imageBuffers: Buffer[]; workdir: string | undefined };
  selectedFiles: SelectedFiles;
  initialize: () => Promise<void>;
  handleDecrypt: (
    manifestArg?: ManifestData,
    imagePathsArg?: string[],
    workdirArg?: string,
    secretKey?: string,
  ) => Promise<void>;
  setError: (err: string | undefined) => void;
  handleFormSubmit: (values: { folders: string[] }) => Promise<void>;
}

export function useDecryptImages(): UseDecryptImagesResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [data, setData] = useState<
    { manifest: ManifestData; imageBuffers: Buffer[]; workdir: string | undefined } | undefined
  >();
  const [selectedFiles, setSelectedFiles] = useState<SelectedFiles>({});

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

      const { manifestPath, imagePaths, workdir } = await findManifestAndImages(filePaths);
      const manifest = await readManifest(manifestPath);
      const validated = validateDecryptFiles(manifest, imagePaths);

      // If not secure, try to decrypt immediately
      if (!manifest.secure) {
        await handleDecrypt(validated.manifest, validated.imagePaths, workdir, undefined);
      }

      setSelectedFiles({
        workdir,
        manifest: validated.manifest,
        imagePaths: validated.imagePaths,
      });
      setIsLoading(false);
    } catch (e) {
      handleError(e);
    }
  };

  // Form submit handler
  async function handleFormSubmit(values: { folders: string[] }) {
    try {
      setIsLoading(true);
      setError(undefined);
      const { folders } = values;
      const { manifestPath, imagePaths, workdir } = await findManifestAndImages(folders);
      const manifest = await readManifest(manifestPath);
      const validated = validateDecryptFiles(manifest, imagePaths);

      // If not secure, try to decrypt immediately
      if (!manifest.secure) {
        await handleDecrypt(validated.manifest, validated.imagePaths, workdir, undefined);
      }

      setSelectedFiles({
        workdir,
        manifest: validated.manifest,
        imagePaths: validated.imagePaths,
      });
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
        const manifest = manifestArg || selectedFiles.manifest;
        const imagePaths = imagePathsArg || selectedFiles.imagePaths;
        const workdir = workdirArg || selectedFiles.workdir;
        const validated = validateDecryptFiles(manifest, imagePaths);
        const imageBuffers = await restoreImagesWithKey(validated.imagePaths, validated.manifest, secretKey);
        setData({ manifest: validated.manifest, imageBuffers, workdir });
        setIsLoading(false);
      } catch (e) {
        handleError(e);
      }
    },
    [selectedFiles],
  );

  return {
    isLoading,
    error,
    data,
    selectedFiles,
    initialize,
    handleDecrypt,
    setError,
    handleFormSubmit,
  };
}
