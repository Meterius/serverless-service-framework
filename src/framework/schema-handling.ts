import path from "path";
import { FrameworkSchema, isFrameworkSchema } from "./service-framework-schema";
import { isServiceSchema, ServiceSchema } from "./service-schema";
import {
  frameworkSchemaExtensions,
  frameworkSchemaNames,
  serviceSchemaExtensions,
  serviceSchemaNames,
} from "./constants";
import { findMatchingFile, getSubDirectories } from "./file-handling";

interface SchemaFile<T> {
  filePath: string;
  dirPath: string;

  schema: T;
}

export type FrameworkSchemaFile = SchemaFile<FrameworkSchema>;

export type ServiceSchemaFile = SchemaFile<ServiceSchema>;

function resolveFrameworkPath(
  frameworkSchemaFile: FrameworkSchemaFile, relativeFilePath: string,
): string {
  return path.join(
    frameworkSchemaFile.dirPath,
    relativeFilePath,
  );
}

export async function getServiceSchemaFilePath(
  schemaDir: string,
): Promise<string | undefined> {
  return findMatchingFile(
    schemaDir,
    serviceSchemaNames,
    serviceSchemaExtensions,
  );
}

export async function getFrameworkSchemaFilePath(
  frameworkDir: string,
): Promise<string | undefined> {
  return findMatchingFile(
    frameworkDir,
    frameworkSchemaNames,
    frameworkSchemaExtensions,
  );
}

async function loadSchemaFile<T>(
  filePath: string,
  typeGuard: (val: unknown) => val is T,
): Promise<SchemaFile<T> | undefined> {
  const ext = path.extname(filePath);

  function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
  }

  const schemaFileBase = {
    filePath,
    dirPath: path.dirname(filePath),
  };

  if (ext === ".ts") {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    require("@babel/register")({
      extensions: [".ts"],
      presets: ["@babel/preset-typescript", "@babel/preset-env"],
    }); // required to transform es6 import syntax and typescript files

    // eslint-disable-next-line max-len
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires, import/no-dynamic-require
    const fileExport = require(filePath);

    if (typeGuard(fileExport)) {
      return {
        ...schemaFileBase,
        schema: fileExport,
      };
    } else if (isObject(fileExport) && typeGuard(fileExport.default)) {
      return {
        ...schemaFileBase,
        schema: fileExport.default,
      };
    } else {
      return undefined;
    }
  } else {
    throw new Error(`Unsupported Extension "${ext}" for Schema at "${filePath}"`);
  }
}

export async function loadFrameworkSchemaFile(filePath: string): Promise<FrameworkSchemaFile> {
  const schema = await loadSchemaFile(filePath, isFrameworkSchema);

  if (schema) {
    return schema;
  } else {
    throw new Error(`Framework Schema at "${filePath}" has an invalid format`);
  }
}

async function loadServiceSchemaFile(filePath: string): Promise<ServiceSchemaFile> {
  const schema = await loadSchemaFile(filePath, isServiceSchema);

  if (schema) {
    return schema;
  } else {
    throw new Error(`Service Schema at "${filePath}" has an invalid format`);
  }
}

export async function loadServiceSchemaFiles(
  frameworkSchemaFile: FrameworkSchemaFile,
): Promise<ServiceSchemaFile[]> {
  // get absolute schema root directory path
  const schemaRoot = resolveFrameworkPath(
    frameworkSchemaFile, frameworkSchemaFile.schema.params.serviceRootDir,
  );

  // find all directories in schema root directory
  const schemaDirs = await getSubDirectories(schemaRoot);

  // find all existing schema files
  const schemaFilePaths = (
    await Promise.all(schemaDirs.map((dir) => getServiceSchemaFilePath(dir)))
  ).filter((file): file is string => typeof file === "string");

  // load the service schema files from the schema file paths
  return Promise.all(
    schemaFilePaths.map((schemaFilePath) => loadServiceSchemaFile(schemaFilePath)),
  );
}

export function getServiceSchemaFileByName(
  serviceSchemaFiles: ServiceSchemaFile[],
  serviceName: string,
): ServiceSchemaFile | undefined {
  return serviceSchemaFiles.find(
    (file) => file.schema.params.shortName === serviceName
      || file.schema.params.name === serviceName,
  );
}
