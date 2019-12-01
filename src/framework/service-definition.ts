import { FrameworkOptions } from "./framework-options";
import {
  serviceDefinitionNames,
  serviceDefinitionExtensions, serviceDefinitionExportProperty,
} from "../common/constants";
import { AwsServiceDefinition } from "./aws";
import { ServiceDefinition } from "./provider-definition";
import { getFindableFilePath, loadDefinitionFile } from "./file-loading";
import { getSubDirectories } from "../common/filesystem";

export function isAwsServiceDefinition(value: unknown): value is AwsServiceDefinition {
  return value instanceof AwsServiceDefinition;
}

export function isServiceDefinition(value: unknown): value is ServiceDefinition {
  return isAwsServiceDefinition(value);
}

export function getServiceDefinitionFilePath(
  filePath: string | undefined, dirPath: string,
): Promise<string | undefined> {
  return getFindableFilePath(
    filePath, dirPath, serviceDefinitionNames, serviceDefinitionExtensions,
  );
}

export function loadServiceDefinitionFile(
  filePath: string, options: FrameworkOptions,
): Promise<ServiceDefinition> {
  return loadDefinitionFile(
    filePath, options, isServiceDefinition, "Service", serviceDefinitionExportProperty,
  );
}

export async function loadServiceDefinitionFilesFromRoot(
  rootPath: string,
  expectEachDirToContainServices: boolean,
  options: FrameworkOptions,
): Promise<ServiceDefinition[]> {
  const dirs = await getSubDirectories(rootPath);

  async function loadFilePath(dirPath: string): Promise<string | undefined> {
    const filePath = await getServiceDefinitionFilePath(undefined, dirPath);

    if (expectEachDirToContainServices && filePath === undefined) {
      throw new Error(
        `Service Definition Directory "${dirPath}" does not contain a Service Definition File`,
      );
    }

    return filePath;
  }

  const files = (await Promise.all(
    dirs.map((dir) => loadFilePath(dir)),
  )).filter((value: string | undefined): value is string => typeof value === "string");

  return Promise.all(files.map((file) => loadServiceDefinitionFile(file, options)));
}
