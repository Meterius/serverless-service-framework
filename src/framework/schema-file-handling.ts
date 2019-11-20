import path from "path";
import { pathExists } from "fs-extra";
import { ValidationError } from "runtypes";
import { isObject } from "../common/type-guards";
import { requireModule } from "../common/require";

function loadTypeCheckedExport<T>(
  filePath: string,
  typeCheck: (val: unknown) => T,
  exportName = "default",
): T {
  const fileExport = requireModule(filePath);

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
