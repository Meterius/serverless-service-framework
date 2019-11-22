import { register } from "ts-node";

register({
  transpileOnly: true,
});

/**
 * Imports and returns Javascript or Typescript module export via node require.
 */
export function requireModule(filePath: string): unknown {
  // eslint-disable-next-line global-require,import/no-dynamic-require
  return require(filePath) as unknown;
}
