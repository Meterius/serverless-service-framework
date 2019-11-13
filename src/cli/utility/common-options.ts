import { GluegunToolbox } from "gluegun";
import { getOption } from "./options";

export function getFrameworkSchemaOption(tb: GluegunToolbox): string | undefined {
  return getOption(tb, "schema");
}
