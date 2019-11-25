export interface NativeFrameworkOptions {
  tsconfigPath?: string; // defaults to tsconfig.json
  transpileOnly?: boolean; // defaults to false
}

export type FrameworkOptions = Required<NativeFrameworkOptions>;

export function getFrameworkOptions(
  nativeOptions: NativeFrameworkOptions,
): FrameworkOptions {
  const tsconfigPath = nativeOptions.tsconfigPath || "tsconfig.json";
  const transpileOnly = nativeOptions.transpileOnly || false;

  return {
    tsconfigPath,
    transpileOnly,
  };
}
