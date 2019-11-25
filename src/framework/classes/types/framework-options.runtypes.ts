import {
  Partial, String, Boolean, Static,
} from "runtypes";

export const NativeFrameworkOptions = Partial({
  tsconfigPath: String,
  transpileOnly: Boolean,
});

export function isNativeFrameworkOptions(value: unknown): Static<typeof NativeFrameworkOptions> {
  return NativeFrameworkOptions.check(value);
}
