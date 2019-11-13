import {
  getFrameworkSchemaFilePath,
  loadFrameworkSchemaFile,
  loadServiceSchemaFiles,
  ServiceSchemaFile,
} from "../../framework/schema-handling";
import { CliError } from "./exceptions";
import { buildServiceServerlessTemplate } from "../../framework/template-handling";
import { createFrameworkContext, FrameworkContext } from "../../framework/context";

export async function loadFrameworkContext(
  frameworkSchemaFilePath?: string,
): Promise<FrameworkContext> {
  const frSchemaPath = frameworkSchemaFilePath
    || (await getFrameworkSchemaFilePath(process.cwd()));

  if (frSchemaPath === undefined) {
    throw new CliError("Didn't find framework schema file");
  }

  const frFile = await loadFrameworkSchemaFile(frSchemaPath);
  const seFiles = await loadServiceSchemaFiles(frFile);

  return createFrameworkContext(frFile, seFiles);
}

export function getService(
  ctx: FrameworkContext,
  serviceName: string,
): ServiceSchemaFile {
  const sFile = ctx.getServiceSchemaFile(serviceName);

  if (sFile === undefined) {
    throw new CliError(`Service "${serviceName}" not found`);
  } else {
    return sFile;
  }
}

export interface ServiceBuildInfo {
  serverlessTemplateFilePath: string;
}

export async function buildService(
  ctx: FrameworkContext,
  serviceName: string,
): Promise<ServiceBuildInfo> {
  const slsPath = await buildServiceServerlessTemplate(
    ctx.frameworkSchemaFile,
    getService(ctx, serviceName),
  );

  return {
    serverlessTemplateFilePath: slsPath,
  };
}
