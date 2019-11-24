import { loadTypescriptModules } from "../common/module-loading";
import { FrameworkSchemaFile } from "./classes";
import { isObject } from "../common/type-guards";

export async function loadSchemaPropertiesFiles<T>(
  filePaths: string[],
  typeCheck: (val: unknown) => T,
  frameworkSchemaFile?: FrameworkSchemaFile,
): Promise<T[]> {
  const results = await loadTypescriptModules(
    filePaths,
    frameworkSchemaFile,
  );

  return results.map((result) => typeCheck(isObject(result) ? result.schema : undefined));
}
