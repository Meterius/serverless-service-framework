import { Register, register } from "ts-node";
import { FrameworkOptions } from "../framework/classes/types/framework-options.types";
import { ServiceContext } from "../framework/classes";

let tsNodeSetup: { register: Register; frameworkOptions: FrameworkOptions };

export function setupServiceTsNodeViaEnv(
  service: ServiceContext,
): Record<string, string> {
  const frameworkOptions = service.context.schema.options;

  return {
    TS_NODE_TRANSPILE_ONLY: frameworkOptions.transpileOnly ? "true" : "false",
    TS_NODE_PROJECT: frameworkOptions.tsconfigPath,
  };
}

export function setupTsNode(
  frameworkOptions: FrameworkOptions,
): void {
  if (tsNodeSetup === undefined) {
    tsNodeSetup = {
      register: register({
        project: frameworkOptions.tsconfigPath,
        transpileOnly: frameworkOptions.transpileOnly,
      }),
      frameworkOptions,
    };
  } else if (tsNodeSetup.frameworkOptions !== frameworkOptions) {
    throw new Error("Cannot reconfigure TsNode with different framework options at the moment");
  }
}

export async function loadTypescriptModules(
  filePaths: string[],
  frameworkOptions: FrameworkOptions,
): Promise<unknown[]> {
  setupTsNode(frameworkOptions);

  return filePaths.map(
    // eslint-disable-next-line global-require,import/no-dynamic-require
    (filePath) => require(filePath),
  );
}

export function loadJavascriptModule(
  filePath: string,
): unknown {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  return require(filePath);
}
