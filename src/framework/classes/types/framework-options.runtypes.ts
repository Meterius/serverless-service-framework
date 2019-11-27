import {
  Partial, String, Boolean, Static, Dictionary,
} from "runtypes";

const NativeProviderOptions = Partial({
  aws: Partial({
    usernameStageMap: Dictionary(String),
    usernameProfileMap: Dictionary(String),
  }),
});

export const NativeFrameworkOptions = Partial({
  tsconfigPath: String,
  transpileOnly: Boolean,
  providerOptions: NativeProviderOptions,
});

export function isNativeFrameworkOptions(value: unknown): Static<typeof NativeFrameworkOptions> {
  return NativeFrameworkOptions.check(value);
}
