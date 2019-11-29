import { FrameworkOptions } from "./framework-options";
import {
  frameworkDefinitionNames,
  frameworkDefinitionExtensions, frameworkDefinitionExportProperty,
} from "../common/constants";
import { AwsFrameworkDefinition } from "./aws";
import { FrameworkDefinition } from "./provider-definition";
import { getFindableFilePath, loadDefinitionFile } from "./file-loading";

export function isAwsFrameworkDefinition(value: unknown): value is AwsFrameworkDefinition {
  return value instanceof AwsFrameworkDefinition;
}

export function isFrameworkDefinition(value: unknown): value is FrameworkDefinition {
  return isAwsFrameworkDefinition(value);
}

export function getFrameworkDefinitionFilePath(
  filePath: string | undefined, dirPath: string,
): Promise<string | undefined> {
  return getFindableFilePath(
    filePath, dirPath, frameworkDefinitionNames, frameworkDefinitionExtensions,
  );
}

export function loadFrameworkDefinitionFile(
  filePath: string, options: FrameworkOptions,
): Promise<FrameworkDefinition> {
  return loadDefinitionFile(
    filePath, options, isFrameworkDefinition, "Framework", frameworkDefinitionExportProperty,
  );
}
