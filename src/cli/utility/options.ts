import { GluegunToolbox } from "gluegun";
import { CliError } from "./exceptions";

export function requireParameters(
  tb: GluegunToolbox,
  names: string[] | string,
  minLength = 1,
  maxLength = 1,
): string[] {
  const parameters = tb.parameters.array || [];
  const ns = typeof names === "string" ? [names] : names;

  if (parameters.length < minLength || parameters.length > maxLength) {
    throw new CliError(
      `Missing required parameter${ns.length > 1 ? "s" : ""} [${ns.join(", ")}]`,
    );
  } else {
    return parameters;
  }
}

export function getOption(
  tb: GluegunToolbox,
  name: string,
  shortName?: string,
): string | undefined;

export function getOption(
  tb: GluegunToolbox,
  name: string,
  shortName: string | undefined,
  defaultValue: string,
): string;

export function getOption(
  tb: GluegunToolbox,
  name: string,
  shortName?: string,
  defaultValue?: string,
): string | undefined {
  const option = tb.parameters.options[name] || (shortName && tb.parameters.options[shortName]);

  return option === undefined ? defaultValue : option;
}

export function requireOption(
  tb: GluegunToolbox,
  name: string,
  shortName?: string,
): string {
  const option = getOption(tb, name, shortName);

  if (option === undefined) {
    throw new CliError(`Missing required option "${name}"`);
  } else {
    return option;
  }
}
