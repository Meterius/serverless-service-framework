import path from "path";

export interface NativeFrameworkOptions {
  tsconfigPath?: string; // defaults to tsconfig.json
  transpileOnly?: boolean; // defaults to false
  stubDirectImports?: unknown; // defaults to undefined

  usernameStageMap?: Record<string, string>; // defaults to {}
  usernameProfileMap?: Record<string, string>; // defaults to {}
}

export type FrameworkOptions = Required<NativeFrameworkOptions>;

export function getFrameworkOptions(
  nativeOptions: NativeFrameworkOptions,
  frameworkDirPath: string,
): FrameworkOptions {
  return {
    tsconfigPath: path.join(frameworkDirPath, nativeOptions.tsconfigPath || "tsconfig.json"),
    transpileOnly: nativeOptions.transpileOnly || false,
    usernameStageMap: nativeOptions.usernameStageMap || {},
    usernameProfileMap: nativeOptions.usernameProfileMap || {},
    stubDirectImports: nativeOptions.stubDirectImports,
  };
}
