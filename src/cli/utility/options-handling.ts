import { CliError } from "./exceptions";
import { TB } from "../cli-types";

export function requireVariadicParameters(
  tb: TB,
  name: string,
  minLength = 0,
  maxLength = Infinity,
): string[] {
  const parameters = tb.parameters.array || [];

  const msg = `Usage <${name}-0> <${name}-1> ...`
    + `(Minimum: ${minLength}${maxLength !== Infinity ? ` Maximum: ${maxLength}` : ""})`;

  if (parameters.length < minLength || parameters.length > maxLength) {
    throw new Error(msg);
  } else {
    return parameters;
  }
}

export function requireParameters(
  tb: TB,
  names: string[],
  optionalNames: string[] = [],
): string[] {
  const parameters = tb.parameters.array || [];

  const msg = `Usage ${
    names.map((name) => `<${name}>`).join(" ")
  } ${
    optionalNames.map((name) => `[${name}]`).join(" ")
  }`;

  if (parameters.length < names.length || parameters.length > names.length + optionalNames.length) {
    throw new CliError(msg);
  } else {
    return parameters;
  }
}

export function requireParameter(
  tb: TB,
  name: string,
): string {
  return requireParameters(tb, [name])[0];
}

export function getOption(
  tb: TB,
  name: string,
  shortName?: string,
): string | undefined;

export function getOption(
  tb: TB,
  name: string,
  shortName: string | undefined,
  defaultValue: string,
): string;

export function getOption(
  tb: TB,
  name: string,
  shortName?: string,
  defaultValue?: string,
): string | undefined {
  const option = tb.parameters.options[name]
    || (shortName && tb.parameters.options[shortName])
    || process.env[`SSF_CLI_OPTION_${name}`];

  const value = option === undefined ? defaultValue : option.toString();

  process.env[`SSF_CLI_USED_OPTION_${name}`] = value;

  return value;
}

export function requireOption(
  tb: TB,
  name: string,
  shortName?: string,
  defaultValue?: string,
): string {
  const option = defaultValue
    ? getOption(tb, name, shortName, defaultValue) : getOption(tb, name, shortName);

  if (option === undefined) {
    throw new CliError(`Missing required option "${name}"`);
  } else {
    return option;
  }
}

export function getFlag(
  tb: TB,
  name: string,
  shortName?: string,
): boolean {
  const option = tb.parameters.options[name]
    || (shortName && tb.parameters.options[shortName])
    || process.env[`SSF_CLI_FLAG_${name}`] === "true";

  const value = option === true;

  process.env[`SSF_CLI_USED_FLAG_${name}`] = value.toString();

  return value;
}
