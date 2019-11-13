import fs, { Dirent } from "fs";
import path from "path";

/**
 * Returns all directories contained in directory dirPath
 */
export async function getSubDirectories(dirPath: string): Promise<string[]> {
  const dirs = await new Promise<Dirent[]>((resolve, reject) => {
    fs.readdir(dirPath, { withFileTypes: true }, ((err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    }));
  });

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
  const existingFilePaths = await Promise.all(
    filePaths.map((filePath) => new Promise<string | undefined>((resolve, reject) => {
      fs.stat(filePath, (err) => {
        if (err) {
          if (err.code === "ENOENT") {
            resolve(undefined);
          } else {
            reject(err);
          }
        } else {
          resolve(filePath);
        }
      });
    })),
  );

  return existingFilePaths.filter((filePath): filePath is string => typeof filePath === "string");
}

/**
 * Looks for existing matching file in directory dirPath.
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
