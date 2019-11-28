import { AwsFramework } from "./aws/aws-framework";
import { FrameworkOptions } from "./framework-options";
import { loadTypescriptModule } from "../common/module-loading";
import { isObject } from "../common/type-guards";
import { findMatchingFile } from "../common/filesystem";
import {
  frameworkExtensions,
  frameworkNames,
  frameworkOptionsExtensions,
  frameworkOptionsNames,
} from "../common/constants";

type Framework = AwsFramework;

function isAwsFramework(value: unknown): value is AwsFramework {
  return value instanceof AwsFramework;
}

export function getFrameworkFilePath(dirPath: string): Promise<string | undefined> {
  return findMatchingFile(dirPath, frameworkNames, frameworkExtensions);
}

export function getFrameworkOptionsFilePath(dirPath: string): Promise<string | undefined> {
  return findMatchingFile(dirPath, frameworkOptionsNames, frameworkOptionsExtensions);
}

export async function loadFrameworkFile(
  filePath: string, options: FrameworkOptions,
): Promise<Framework> {
  const exportProperty = "framework";

  const data = await loadTypescriptModule(filePath, options);

  let value: unknown;
  if (isObject(data)) {
    value = data[exportProperty];
  }

  if (value === undefined) {
    throw new Error(`Framework File "${filePath}" does not export "${exportProperty}"`);
  }

  if (isAwsFramework(value)) {
    return value;
  } else {
    throw new Error(
      `Framework File "${filePath}" exports unrecognized value as "${exportProperty}"`,
    );
  }
}
