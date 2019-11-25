import { loadJavascriptModule, loadTypescriptModules } from "../common/module-loading";
import { isObject } from "../common/type-guards";
import { FrameworkOptions, getFrameworkOptions } from "./classes/types/framework-options.types";
import { isNativeFrameworkOptions } from "./classes/types/framework-options.runtypes";

export async function loadSchemaPropertiesFiles<T>(
  filePaths: string[],
  typeCheck: (val: unknown) => T,
  frameworkOptions: FrameworkOptions,
): Promise<T[]> {
  const results = await loadTypescriptModules(
    filePaths,
    frameworkOptions,
  );

  return results.map((result) => typeCheck(isObject(result) ? result.schema : undefined));
}

export async function loadFrameworkOptionsFile(
  filePath: string,
): Promise<FrameworkOptions> {
  return getFrameworkOptions(
    isNativeFrameworkOptions(
      loadJavascriptModule(filePath),
    ),
  );
}
