import {
  Partial, String, Boolean, Static, Dictionary, Unknown,
} from "runtypes";

export const NativeFrameworkOptions = Partial({
  tsconfigPath: String,
  transpileOnly: Boolean,
  stubDirectImports: Unknown,
  usernameStageMap: Dictionary(String),
  usernameProfileMap: Dictionary(String),
});

export function isNativeFrameworkOptions(value: unknown): Static<typeof NativeFrameworkOptions> {
  return NativeFrameworkOptions.check(value);
}
