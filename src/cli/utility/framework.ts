import { pathExists } from "fs-extra";
import { FrameworkContext } from "../../framework/classes/framework-context";
import { FrameworkSchemaFile } from "../../framework/classes/framework-schema-file";
import { CliError } from "./exceptions";
import { ServiceContext } from "../../framework/classes/service-context";

export async function loadFrameworkContext(
  frameworkSchemaFilePath: string | undefined,
  stage: string,
): Promise<FrameworkContext> {
  const frSchemaPath = frameworkSchemaFilePath
    || (await FrameworkSchemaFile.getFrameworkSchemaFilePath(process.cwd()));

  if (frSchemaPath === undefined) {
    throw new CliError("No framework schema file exists in current directory");
  } else if (
    frameworkSchemaFilePath !== undefined && !(await pathExists(frameworkSchemaFilePath))
  ) {
    throw new CliError(
      `Specified framework schema file "${frameworkSchemaFilePath}" does not exist`,
    );
  }

  const frFile = await FrameworkSchemaFile.loadFrameworkSchemaFile(frSchemaPath);

  return FrameworkContext.loadFrameworkContext(frFile, stage);
}

export function getService(
  ctx: FrameworkContext,
  serviceName: string,
): ServiceContext {
  const sFile = ctx.getService(serviceName);

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
  const service = getService(ctx, serviceName);

  return {
    serverlessTemplateFilePath: await service.buildServiceServerlessTemplate(),
  };
}
