import { userInfo } from "os";
import { getFlag, getOption, requireOption } from "./options-handling";
import { TB } from "../cli-types";
import { FrameworkOptions } from "../../framework/framework-options";

const { username } = userInfo();

export function getTranspileOnlyFlag(tb: TB): boolean {
  return getFlag(tb, "transpileOnly");
}

export function getStubDirectImportsFlag(tb: TB): boolean {
  return getFlag(tb, "stubDirectImports");
}

export function getParallelFlag(tb: TB): boolean {
  return getFlag(tb, "parallel");
}

export function getFrameworkDefinitionOption(tb: TB): string | undefined {
  return getOption(tb, "definition");
}

export function getFrameworkOptionsOption(tb: TB): string | undefined {
  return getOption(tb, "options");
}

function getDirectProfileOption(tb: TB): string | undefined {
  return getOption(tb, "profile", "p");
}

export function getProfileOption(tb: TB, options: FrameworkOptions): string | undefined {
  return getDirectProfileOption(tb) || options.usernameProfileMap[username];
}

function requireDirectStageOption(tb: TB, fallback?: string): string {
  return requireOption(tb, "stage", "s", fallback);
}

export function requireStageOption(tb: TB, options: FrameworkOptions): string {
  return requireDirectStageOption(tb, options.usernameStageMap[username]);
}

export function applyFrameworkOptionOptions(tb: TB, options: FrameworkOptions): FrameworkOptions {
  return {
    ...options,
    transpileOnly: getTranspileOnlyFlag(tb) || options.transpileOnly,
    stubDirectImports: getStubDirectImportsFlag(tb) ? "" : options.stubDirectImports,
  };
}
