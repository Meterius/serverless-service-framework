import path from "path";
import { readdirSync } from "fs";
import { pathExists } from "fs-extra";

/**
 * Returns all directories contained in directory dirPath
 */
export async function getSubDirectories(dirPath: string): Promise<string[]> {
  const dirs = readdirSync(dirPath, { withFileTypes: true });

  return dirs.filter(
    (entry) => entry.isDirectory(),
  ).map(
    (entry) => path.join(dirPath, entry.name),
  );
}

/**
 * Takes in a number of file paths and returns only the ones that exist.
 */
export async function filterExistingFiles(filePaths: string[]): Promise<string[]> {
  const filePathExistence = await Promise.all(
    filePaths.map((filePath) => pathExists(filePath)),
  );

  return filePaths.filter((filePath, index) => filePathExistence[index]);
}

/**
 * Looks for existing matching file of type [a file-name].[any file-extension] in directory dirPath.
 *
 * When multiple matching files exist the one with
 * the name with lower index or if equal the lower extension index
 * is returned.
 */
export async function findMatchingFile(
  dirPath: string,
  fileNames: string[],
  extensions: string[],
): Promise<string | undefined> {
  const filePaths = fileNames.reduce(
    (prev: string[], name) => prev.concat(extensions.map((ext) => `${name}.${ext}`)), [],
  ).map((file) => path.join(dirPath, file));

  return (await filterExistingFiles(filePaths))[0];
}
