import { register } from "ts-node";
import { FrameworkSchemaFile } from "../framework/classes";

export async function loadTypescriptModules(
  filePaths: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  frameworkSchemaFile?: FrameworkSchemaFile,
): Promise<unknown[]> {
  register({
    transpileOnly: true,
    skipProject: true,
  });

  // eslint-disable-next-line global-require,import/no-dynamic-require
  return filePaths.map((filePath) => require(filePath));
}

export async function loadTypescriptModule(
  filePath: string,
  frameworkSchemaFile?: FrameworkSchemaFile,
): Promise<unknown> {
  return (await loadTypescriptModules([filePath], frameworkSchemaFile))[0];
}
