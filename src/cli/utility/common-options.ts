import { userInfo } from "os";
import { getFlag, getOption, requireOption } from "./options-handling";
import { TB } from "../cli-types";
import { FrameworkOptions } from "../../framework/classes";

const { username } = userInfo();

export function getParallelFlag(tb: TB): boolean {
  return getFlag(tb, "parallel");
}

export function getFrameworkSchemaOption(tb: TB): string | undefined {
  return getOption(tb, "schema");
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
