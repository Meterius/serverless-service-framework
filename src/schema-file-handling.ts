import fs, { Dirent } from "fs";
import path from "path";
import { FrameworkSchema, isFrameworkSchema } from "./service-framework-schema";
import { isServiceSchema, ServiceSchema } from "./service-schema";

const searchedServiceSchemaNames = ["service-schema"];
const searchedSchemaExtensions = ["ts"];

export interface FrameworkSchemaFile {
  path: string;
  schema: FrameworkSchema;
}

export interface ServiceSchemaFile {
  path: string;
  schema: ServiceSchema;
}

async function getSubDirectories(dirPath: string): Promise<string[]> {
  const dirs = await new Promise<Dirent[]>((resolve, reject) => {
    fs.readdir(dirPath, { withFileTypes: true }, ((err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    }));
  });

  return dirs.filter(
    (entry) => entry.isDirectory(),
  ).map(
    (entry) => path.join(dirPath, entry.name),
  );
}

async function filterExistingFiles(filePaths: string[]): Promise<string[]> {
  const existingFilePaths = await Promise.all(
    filePaths.map((filePath) => new Promise<string | undefined>((resolve, reject) => {
      fs.stat(filePath, (err) => {
        if (err) {
          if (err.code === "ENOENT") {
            resolve(undefined);
          } else {
            reject(err);
          }
        } else {
          resolve(filePath);
        }
      });
    })),
  );

  return existingFilePaths.filter((filePath): filePath is string => typeof filePath === "string");
}

function resolveFrameworkPath(frameworkSchemaFilePath: string, relativeFilePath: string): string {
  return path.join(frameworkSchemaFilePath, relativeFilePath);
}

async function getServiceSchemaFile(
  schemaDir: string,
): Promise<string | undefined> {
  const possibleFileNames = searchedServiceSchemaNames.map(
    (name) => searchedSchemaExtensions.map((ext) => `${name}.${ext}`),
  ).reduce((prev, curr) => curr.concat(prev), []);

  const fileNames = await filterExistingFiles(
    possibleFileNames.map((fileName) => path.join(schemaDir, fileName)),
  );

  return fileNames[0];
}

async function loadSchemaFile(filePath: string): Promise<any> {
  const ext = path.extname(filePath);

  if (ext === "ts") {
    await import("ts-node"); // required to load ts files in vanilla node
    return import(filePath);
  } else {
    throw new Error(`Unsupported Extension "${ext}" for Schema at "${filePath}"`);
  }
}

export async function loadFrameworkSchemaFile(filePath: string): Promise<FrameworkSchemaFile> {
  const fileExport = await loadSchemaFile(filePath);

  if (isFrameworkSchema(fileExport)) {
    return {
      path: filePath,
      schema: fileExport,
    };
  } else {
    throw new Error(`Framework Schema at "${filePath}" has an invalid format`);
  }
}

async function loadServiceSchemaFile(filePath: string): Promise<ServiceSchemaFile> {
  const fileExport = await loadSchemaFile(filePath);

  if (isServiceSchema(fileExport)) {
    return {
      path: filePath,
      schema: fileExport,
    };
  } else {
    throw new Error(`Framework Schema at "${filePath}" has an invalid format`);
  }
}

export async function loadServiceSchemaFiles(
  frameworkSchemaFile: FrameworkSchemaFile,
): Promise<ServiceSchemaFile[]> {
  // get absolute schema root directory path
  const schemaRoot = resolveFrameworkPath(
    frameworkSchemaFile.path, frameworkSchemaFile.schema.params.serviceRootDir,
  );

  // find all directories in schema root directory
  const schemaDirs = await getSubDirectories(schemaRoot);

  // find all existing schema files
  const schemaFilePaths = (
    await Promise.all(schemaDirs.map((dir) => getServiceSchemaFile(dir)))
  ).filter((file): file is string => typeof file === "string");

  // load the service schema files from the schema file paths
  return Promise.all(
    schemaFilePaths.map((schemaFilePath) => loadServiceSchemaFile(schemaFilePath)),
  );
}
