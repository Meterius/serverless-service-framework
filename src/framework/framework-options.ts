import path from "path";
import { isNativeFrameworkOptions } from "./framework-options.runtypes";
import { loadJavascriptModule } from "../common/module-loading";
import { frameworkOptionsExtensions, frameworkOptionsNames } from "../common/constants";
import { getFindableFilePath } from "./file-loading";

export interface NativeFrameworkOptions {
  tsconfigPath?: string; // defaults to tsconfig.json
  transpileOnly?: boolean; // defaults to false
  stubDirectImports?: unknown; // defaults to undefined

  usernameStageMap?: Record<string, string>; // defaults to {}
  usernameProfileMap?: Record<string, string>; // defaults to {}
}

export type FrameworkOptions = Required<NativeFrameworkOptions>;

export function getFrameworkOptionsFilePath(
  filePath: string | undefined,
  dirPath: string,
): Promise<string | undefined> {
  return getFindableFilePath(
    filePath, dirPath, frameworkOptionsNames, frameworkOptionsExtensions,
  );
}

export function getFrameworkOptions(
  nativeOptions: NativeFrameworkOptions,
  optionFilePath: string,
): FrameworkOptions {
  const dir = path.dirname(optionFilePath);

  return {
    tsconfigPath: path.join(dir, nativeOptions.tsconfigPath || "tsconfig.json"),
    transpileOnly: nativeOptions.transpileOnly || false,
    usernameStageMap: nativeOptions.usernameStageMap || {},
    usernameProfileMap: nativeOptions.usernameProfileMap || {},
    stubDirectImports: nativeOptions.stubDirectImports,
  };
}

export async function loadFrameworkOptionsFile(
  filePath: string,
): Promise<FrameworkOptions> {
  return getFrameworkOptions(
    isNativeFrameworkOptions(
      loadJavascriptModule(filePath),
    ),
    filePath,
  );
}
