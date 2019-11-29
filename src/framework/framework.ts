import { FrameworkOptions } from "./framework-options";
import { AwsFramework } from "./aws";
import { isAwsFrameworkDefinition } from "./framework-definition";
import { Framework, FrameworkDefinition } from "./provider-definition";

export async function createFramework(
  definition: FrameworkDefinition,
  options: FrameworkOptions,
  stage: string,
  profile?: string,
): Promise<Framework> {
  let framework: Framework;

  const serviceDefinitions = await definition.getServiceDefinitions(options);

  if (isAwsFrameworkDefinition(definition)) {
    framework = new AwsFramework(
      definition.dirPath, definition.props, options, serviceDefinitions, stage, profile,
    );
  } else {
    throw new Error("Unknown Framework Definition Provider");
  }

  return framework;
}
