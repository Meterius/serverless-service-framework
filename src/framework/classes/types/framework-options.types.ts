interface NativeProviderOptions {
  aws?: {
    usernameStageMap?: Record<string, string>; // defaults to {}
    usernameProfileMap?: Record<string, string>; // defaults to {}
  };
}

type ProviderOptions = Required<{
  [key in keyof NativeProviderOptions]: Required<NativeProviderOptions[key]>
}>;

export interface NativeFrameworkOptions {
  tsconfigPath?: string; // defaults to tsconfig.json
  transpileOnly?: boolean; // defaults to false
  providerOptions?: NativeProviderOptions; // defaults to {}
}

export type FrameworkOptions = Required<Omit<NativeFrameworkOptions, "providerOptions">> & {
  providerOptions: ProviderOptions;
};

function getProviderOptions(
  providerOptions: NativeProviderOptions = {},
): ProviderOptions {
  const aws = {
    usernameStageMap: {},
    usernameProfileMap: {},
    ...providerOptions.aws || {},
  };

  return {
    aws,
  };
}

export function getFrameworkOptions(
  nativeOptions: NativeFrameworkOptions,
): FrameworkOptions {
  const tsconfigPath = nativeOptions.tsconfigPath || "tsconfig.json";
  const transpileOnly = nativeOptions.transpileOnly || false;

  return {
    tsconfigPath,
    transpileOnly,

    providerOptions: getProviderOptions(nativeOptions.providerOptions),
  };
}
