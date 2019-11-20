import path from "path";
import { pathExists } from "fs-extra";
import { ValidationError } from "runtypes";
import { isObject } from "../common/type-guards";

function loadTypeCheckedExport<T>(
  filePath: string,
  typeCheck: (val: unknown) => T,
  exportName = "default",
): T {
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
  require("ts-node/register"); // required to transform es6 import syntax and typescript files

  // eslint-disable-next-line max-len
  // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, import/no-dynamic-require
  const fileExport: unknown = require(filePath) as unknown;

  if (isObject(fileExport) && Object.keys(fileExport).includes(exportName)) {
    try {
      return typeCheck(fileExport[exportName]);
    } catch (err) {
      if (err instanceof ValidationError) {
        throw new ValidationError(
          `${err.message} (at export "${exportName}" of "${filePath}")`, err.key,
        );
      } else {
        throw err;
      }
    }
  } else {
    throw new Error(`File "${filePath}" does not export "${exportName}"`);
  }
}

export async function loadSchemaPropertiesFile<T>(
  filePath: string,
  schemaTypeCheck: (val: unknown) => T,
): Promise<T> {
  const ext = path.extname(filePath);

  if (!(await pathExists(filePath))) {
    throw new Error(`File "${filePath}" not found`);
  }

  if (ext === ".ts") {
    return loadTypeCheckedExport(filePath, schemaTypeCheck, "schema");
  } else {
    throw new Error(`Unsupported Extension "${ext}" for Schema at "${filePath}"`);
  }
}
