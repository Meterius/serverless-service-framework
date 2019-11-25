import requireFromString from "require-from-string";
import { create } from "ts-node";
import { readFile } from "fs-extra";
import { FrameworkOptions } from "../framework/classes/types/framework-options.types";

export async function loadTypescriptModules(
  filePaths: string[],
  frameworkOptions: FrameworkOptions,
): Promise<unknown[]> {
  const tsRegister = create({
    project: frameworkOptions.tsconfigPath,
    transpileOnly: frameworkOptions.transpileOnly,
  });

  type FilePath = string;
  type FileTsCode = string;
  type FileJsCode = string;

  const files: [FilePath, FileTsCode][] = (await Promise.all(
    filePaths.map((filePath) => readFile(filePath)),
  )).map((fileContent, index) => [filePaths[index], fileContent.toString()]);

  const fileModules: [FilePath, FileJsCode][] = files.map(
    ([filePath, fileTsCode]) => [filePath, tsRegister.compile(fileTsCode, filePath)],
  );

  const fileExports = fileModules.map(
    ([filePath, fileJsCode]) => requireFromString(fileJsCode, filePath, {}),
  );

  return fileExports;
}

export function loadJavascriptModule(
  filePath: string,
): unknown {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  return require(filePath);
}
