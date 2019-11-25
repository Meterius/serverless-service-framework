import { getFlag, getOption, requireOption } from "./options-handling";
import { TB } from "../cli-types";

export function getParallelFlag(tb: TB): boolean {
  return getFlag(tb, "parallel");
}

export function getFrameworkSchemaOption(tb: TB): string | undefined {
  return getOption(tb, "schema");
}

export function getFrameworkOptionsOption(tb: TB): string | undefined {
  return getOption(tb, "options");
}

export function getProfileOption(tb: TB): string | undefined {
  return getOption(tb, "profile", "p");
}

export function requireStageOption(tb: TB): string {
  return requireOption(tb, "stage", "s");
}
