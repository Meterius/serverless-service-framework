import path from "path";
import mkdirp from "mkdirp";
import { readdirSync } from "fs";
import { pathExists, writeFile } from "fs-extra";
import { promisify } from "util";
import { serviceBuildDir } from "./constants";

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

/**
 * Writes file into service build directory and
 * creates necessary directories.
 *
 * Returns absolute file path of written file.
 */
export async function writeServiceBuildFile(
  serviceDirPath: string,
  relativeFilePath: string,
  fileData: string,
): Promise<string> {
  const filePath = path.join(serviceDirPath, serviceBuildDir, relativeFilePath);

  await promisify(mkdirp)(path.dirname(filePath));

  await writeFile(filePath, fileData);

  return filePath;
}

export async function loadSchemaFile<T>(
  filePath: string,
  schemaTypeGuard: (val: unknown) => val is T,
  schemaTypeName: string,
): Promise<T> {
  const ext = path.extname(filePath);

  function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  if (ext === ".ts") {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    require("@babel/register")({
      extensions: [".ts"],
      presets: ["@babel/preset-typescript", "@babel/preset-env"],
    }); // required to transform es6 import syntax and typescript files

    // eslint-disable-next-line max-len
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, import/no-dynamic-require
    const fileExport = require(filePath);

    if (schemaTypeGuard(fileExport)) {
      return fileExport;
    } else if (isObject(fileExport) && schemaTypeGuard(fileExport.default)) {
      return fileExport.default;
    } else {
      throw new Error(`Export from Schema at "${filePath}" is not a ${schemaTypeName}`);
    }
  } else {
    throw new Error(`Unsupported Extension "${ext}" for Schema at "${filePath}"`);
  }
}
