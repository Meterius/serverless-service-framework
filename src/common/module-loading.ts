import { Register, register as tsRegister, RegisterOptions } from "ts-node";
import { FrameworkOptions } from "../framework/classes/types/framework-options.types";

function tsPathRegister(): void {
  // eslint-disable-next-line global-require
  require("tsconfig-paths/register");
}

let tsNodeSetup: { register: Register; frameworkOptions: FrameworkOptions };

export function getTsNodeOptions(
  frameworkOptions: FrameworkOptions,
): { asProcessEnvironment: Record<string, string>; asRegisterOptions: RegisterOptions } {
  return {
    asProcessEnvironment: {
      TS_NODE_TRANSPILE_ONLY: frameworkOptions.transpileOnly ? "true" : "false",
      TS_NODE_PROJECT: frameworkOptions.tsconfigPath,
    },
    asRegisterOptions: {
      transpileOnly: frameworkOptions.transpileOnly,
      project: frameworkOptions.tsconfigPath,
    },
  };
}

export function setupTsNode(
  frameworkOptions: FrameworkOptions,
): void {
  if (tsNodeSetup === undefined) {
    tsNodeSetup = {
      register: tsRegister(
        getTsNodeOptions(frameworkOptions).asRegisterOptions,
      ),
      frameworkOptions,
    };

    tsPathRegister();
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
