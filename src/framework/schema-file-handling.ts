import path from "path";

export async function loadSchemaFile<T>(
  filePath: string,
  schemaTypeGuard: (val: unknown) => val is T,
  schemaTypeName: string,
): Promise<T> {
  const ext = path.extname(filePath);

  function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  if (ext === ".ts") {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    require("ts-node/register"); // required to transform es6 import syntax and typescript files

    // eslint-disable-next-line max-len
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, import/no-dynamic-require
    const fileExport = require(filePath);

    if (schemaTypeGuard(fileExport)) {
      return fileExport;
    } else if (isObject(fileExport) && schemaTypeGuard(fileExport.default)) {
      return fileExport.default;
    } else {
      throw new Error(`Export from Schema at "${filePath}" is not a ${schemaTypeName}`);
    }
  } else {
    throw new Error(`Unsupported Extension "${ext}" for Schema at "${filePath}"`);
  }
}
