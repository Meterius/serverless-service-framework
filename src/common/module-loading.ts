import { Register, register } from "ts-node";
import { FrameworkOptions } from "../framework/classes/types/framework-options.types";

let tsNodeSetup: { register: Register; frameworkOptions: FrameworkOptions };

function setupTsNode(
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
