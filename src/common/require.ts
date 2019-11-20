/**
 * Imports and returns Javascript or Typescript module export via node require.
 */
export function requireModule(filePath: string): unknown {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  require("ts-node/register"); // required to transform typescript files

  // eslint-disable-next-line max-len
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, import/no-dynamic-require
  return require(filePath) as unknown;
}
