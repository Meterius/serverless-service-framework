import { pathExists } from "fs-extra";
import { FrameworkOptions } from "./framework-options";
import { loadTypescriptModule } from "../common/module-loading";
import { isObject } from "../common/type-guards";
import { findMatchingFile } from "../common/filesystem";
import {
  frameworkDefinitionNames,
  frameworkDefinitionExtensions,
} from "../common/constants";
import { AwsFrameworkDefinition } from "./aws";
import { FrameworkDefinition } from "./provider-definition";

export function isAwsFrameworkDefinition(value: unknown): value is AwsFrameworkDefinition {
  return value instanceof AwsFrameworkDefinition;
}

export function isFrameworkDefinition(value: unknown): value is FrameworkDefinition {
  return isAwsFrameworkDefinition(value);
}

export function getFrameworkDefinitionFilePath(dirPath: string): Promise<string | undefined> {
  return findMatchingFile(dirPath, frameworkDefinitionNames, frameworkDefinitionExtensions);
}

export function existsFrameworkDefinitionFilePath(filePath: string): Promise<boolean> {
  return pathExists(filePath);
}

export async function loadFrameworkDefinitionFile(
  filePath: string, options: FrameworkOptions,
): Promise<FrameworkDefinition> {
  const exportProperty = "framework";

  const data = await loadTypescriptModule(filePath, options);

  let value: unknown;
  if (isObject(data)) {
    value = data[exportProperty];
  }

  if (value === undefined) {
    throw new Error(`Framework File "${filePath}" does not export "${exportProperty}"`);
  }

  if (isAwsFrameworkDefinition(value)) {
    return value;
  } else {
    throw new Error(
      `Framework File "${filePath}" exports unrecognized value as "${exportProperty}"`,
    );
  }
}
