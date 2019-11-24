import { create } from "ts-node";
import { readFile } from "fs-extra";
import requireFromString from "require-from-string";
import { FrameworkSchemaFile } from "../framework/classes";

export async function loadTypescriptModules(
  filePaths: string[],
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  frameworkSchemaFile?: FrameworkSchemaFile,
): Promise<unknown[]> {
  const tsRegister = create({
    skipProject: true,
    transpileOnly: true,
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

  return fileModules.map(
    ([filePath, fileJsCode]) => requireFromString(fileJsCode, filePath, {}),
  );
}

export async function loadTypescriptModule(
  filePath: string,
  frameworkSchemaFile?: FrameworkSchemaFile,
): Promise<unknown> {
  return (await loadTypescriptModules([filePath], frameworkSchemaFile))[0];
}
