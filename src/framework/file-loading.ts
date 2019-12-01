import { pathExists } from "fs-extra";
import { FrameworkOptions } from "./framework-options";
import { loadTypescriptModule } from "../common/module-loading";
import { isObject } from "../common/type-guards";
import { findMatchingFile } from "../common/filesystem";

export async function getFindableFilePath(
  filePath: string | undefined,
  dirPath: string,
  defintionNames: string[],
  definitionExtensions: string[],
): Promise<string | undefined> {
  if (filePath) {
    if (await pathExists(filePath)) {
      return filePath;
    } else {
      return undefined;
    }
  } else {
    return findMatchingFile(dirPath, defintionNames, definitionExtensions);
  }
}

export async function loadDefinitionFile<D>(
  filePath: string,
  options: FrameworkOptions,
  typeGuard: (value: unknown) => value is D,
  definitionName: string,
  exportProperty: string,
): Promise<D> {
  const data = await loadTypescriptModule(filePath, options);

  let value: unknown;
  if (isObject(data)) {
    value = data[exportProperty];
  }

  if (value === undefined) {
    throw new Error(
      `${definitionName} Definition File "${filePath}" does not export "${exportProperty}"`,
    );
  }

  if (typeGuard(value)) {
    return value;
  } else {
    throw new Error(
      `${definitionName} Definition File "${filePath}"`
    + ` exports unrecognized value as "${exportProperty}"`,
    );
  }
}
