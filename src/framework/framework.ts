import { FrameworkOptions } from "./framework-options";
import { AwsFramework } from "./aws";
import { isAwsFrameworkDefinition } from "./framework-definition";
import { Framework, FrameworkDefinition } from "./provider-definition";

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
