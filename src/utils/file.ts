import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Create a directory
 * @param dir Directory path
 * @param recursive Create parent directories if they don't exist
 */
export async function createDir(dir: string, recursive = false) {
  await fs.mkdir(dir, { recursive });
}

/**
 * Check if a directory exists
 * @param dir Directory path
 * @returns True if the directory exists, false if it does not
 */
export async function exists(dir: string) {
  return await fs
    .access(dir)
    .then(() => true)
    .catch(() => false);
}

/**
 * Create a directory if it does not exist
 * @param dir Directory path
 * @returns True if the directory was created, false if it already existed
 */
export async function createDirIfNotExists(dir: string) {
  if (await exists(dir)) {
    return;
  }

  await createDir(dir, true);
}

/**
 * Write a file
 * @param dir Directory path
 * @param filename Filename
 * @param data Data to write
 * @returns Path to the file
 */
export async function writeFile(dir: string, filename: string, data: string | Buffer) {
  const filePath = path.join(dir, filename);
  await fs.writeFile(filePath, data);
  return filePath;
}
