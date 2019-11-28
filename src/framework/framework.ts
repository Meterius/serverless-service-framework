import { FrameworkOptions } from "./framework-options";
import { AwsFramework } from "./aws";
import { isAwsFrameworkDefinition, FrameworkDefinition } from "./framework-definition";

export type Framework = AwsFramework;

export function createFramework(
  definition: FrameworkDefinition,
  options: FrameworkOptions,
  stage: string,
  profile?: string,
): Framework {
  if (isAwsFrameworkDefinition(definition)) {
    return new AwsFramework(definition, options, stage, profile);
  } else {
    throw new Error("Unknown Framework Definition Provider");
  }
}
