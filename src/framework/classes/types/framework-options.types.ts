export interface NativeFrameworkOptions {
  tsconfigPath?: string; // defaults to tsconfig.json
  transpileOnly?: boolean; // defaults to false

  usernameStageMap?: Record<string, string>; // defaults to {}
  usernameProfileMap?: Record<string, string>; // defaults to {}
}

export type FrameworkOptions = Required<NativeFrameworkOptions>;

export function getFrameworkOptions(
  nativeOptions: NativeFrameworkOptions,
): FrameworkOptions {
  return {
    tsconfigPath: nativeOptions.tsconfigPath || "tsconfig.json",
    transpileOnly: nativeOptions.transpileOnly || false,
    usernameStageMap: nativeOptions.usernameStageMap || {},
    usernameProfileMap: nativeOptions.usernameProfileMap || {},
  };
}
