import path from "path";
import { pathExists } from "fs-extra";
import { isObject } from "../common/type-guards";

function loadTypeGuardedExport<T>(
  filePath: string,
  typeGuard: (val: unknown) => val is T,
  exportName = "default",
): T | undefined {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  require("ts-node/register"); // required to transform es6 import syntax and typescript files

  // eslint-disable-next-line max-len
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, import/no-dynamic-require
  const fileExport: unknown = require(filePath) as unknown;

  if (isObject(fileExport)) {
    const exportValue: unknown = fileExport[exportName];

    if (typeGuard(exportValue)) {
      return exportValue;
    }
  }

  return undefined;
}

export async function loadSchemaPropertiesFile<T>(
  filePath: string,
  schemaTypeGuard: (val: unknown) => val is T,
  schemaTypeName: string,
): Promise<T> {
  const ext = path.extname(filePath);

  if (!(await pathExists(filePath))) {
    throw new Error(`File "${filePath}" not found`);
  }

  if (ext === ".ts" || ext === ".js") {
    const fileExport = loadTypeGuardedExport(filePath, schemaTypeGuard, "schema");

    if (fileExport !== undefined) {
      return fileExport;
    } else {
      throw new Error(`Export from Schema at "${filePath}" is not a ${schemaTypeName}`);
    }
  } else {
    throw new Error(`Unsupported Extension "${ext}" for Schema at "${filePath}"`);
  }
}
