import { getOption, requireOption } from "./options";
import { TB } from "../cli-types";

export function getFrameworkSchemaOption(tb: TB): string | undefined {
  return getOption(tb, "schema");
}

export function getProfileOption(tb: TB): string | undefined {
  return getOption(tb, "profile", "p");
}

export function requireStageOption(tb: TB): string {
  return requireOption(tb, "stage", "s");
}
