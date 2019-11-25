import { register } from "ts-node";
import { FrameworkOptions } from "../framework/classes/types/framework-options.types";

export async function loadTypescriptModules(
  filePaths: string[],
  frameworkOptions: FrameworkOptions,
): Promise<unknown[]> {
  register({
    transpileOnly: frameworkOptions.transpileOnly,
    project: frameworkOptions.tsconfigPath,
  });

  // eslint-disable-next-line global-require,import/no-dynamic-require
  return filePaths.map((filePath) => require(filePath));
}

export function loadJavascriptModule(
  filePath: string,
): unknown {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  return require(filePath);
}
