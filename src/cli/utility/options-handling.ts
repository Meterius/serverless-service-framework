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

export function getFlag(
  tb: TB,
  name: string,
  shortName?: string,
): boolean {
  const option = tb.parameters.options[name] || (shortName && tb.parameters.options[shortName]);

  return option === true;
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
  const option = tb.parameters.options[name] || (shortName && tb.parameters.options[shortName]);

  return option === undefined ? defaultValue : option.toString();
}

export function requireOption(
  tb: TB,
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