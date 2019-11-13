import {
  FrameworkSchemaFile,
  getFrameworkSchemaFilePath,
  getServiceSchemaFileByName,
  loadFrameworkSchemaFile,
  loadServiceSchemaFiles,
  ServiceSchemaFile,
} from "../../framework/schema-handling";
import { CliError } from "./exceptions";
import { buildServiceServerlessTemplate } from "../../framework/template-handling";

export interface FrameworkFiles {
  framework: FrameworkSchemaFile;
  services: ServiceSchemaFile[];
}

export async function loadFrameworkSchemas(
  frameworkSchemaFilePath?: string,
): Promise<FrameworkFiles> {
  const frSchemaPath = frameworkSchemaFilePath
    || (await getFrameworkSchemaFilePath(process.cwd()));

  if (frSchemaPath === undefined) {
    throw new CliError("Didn't find framework schema file");
  }

  const frFile = await loadFrameworkSchemaFile(frSchemaPath);
  const seFiles = await loadServiceSchemaFiles(frFile);

  return {
    framework: frFile,
    services: seFiles,
  };
}

export function getService(
  frameworkFiles: FrameworkFiles,
  serviceName: string,
): ServiceSchemaFile {
  const sFile = getServiceSchemaFileByName(
    frameworkFiles.services,
    serviceName,
  );

  if (sFile === undefined) {
    throw new CliError(`Service "${serviceName}" not found`);
  } else {
    return sFile;
  }
}

export async function buildService(
  frameworkFiles: FrameworkFiles,
  serviceName: string,
): Promise<void> {
  await buildServiceServerlessTemplate(
    frameworkFiles.framework,
    getService(frameworkFiles, serviceName),
  );
}
