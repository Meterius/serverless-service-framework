import { pathExists } from "fs-extra";
import chalk from "chalk";
import path from "path";
import { FrameworkContext, FrameworkSchemaFile, ServiceContext } from "../../framework/classes";
import { CliError } from "./exceptions";
import { TB } from "../cli-types";
import { applyFrameworkOptionOptions, requireStageOption } from "./common-options";
import { getProviderEnv, ProviderContext } from "./provider-configuration";
import { bufferedExec } from "./buffered-exec";
import { HookName, runHook } from "./hook-execution";

export async function loadFrameworkContext(
  tb: TB,
  frameworkSchemaFilePath: string | undefined,
  frameworkOptionsFilePath: string | undefined,
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

  const frOptionsPath = frameworkOptionsFilePath
    || (await FrameworkSchemaFile.getFrameworkOptionsFilePath(process.cwd()));

  if (frOptionsPath === undefined) {
    throw new CliError("No framework options file exists in current directory");
  } else if (
    frameworkOptionsFilePath !== undefined && !(await pathExists(frOptionsPath))
  ) {
    throw new CliError(
      `Specified framework options file "${frOptionsPath}" does not exist`,
    );
  }

  const frOpts = applyFrameworkOptionOptions(
    tb, await FrameworkSchemaFile.loadFrameworkOptionsFile(frOptionsPath, frSchemaPath),
  );

  const stage = requireStageOption(tb, frOpts);

  const frFile = await FrameworkSchemaFile.loadFrameworkSchemaFile(frSchemaPath, frOpts);

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
    serverlessTemplateFilePath: await service.getServerlessTemplateFilePath(),
  };
}

export interface ExecServerlessCommandParams {
  tb: TB;
  service: ServiceContext;
  providerContext: ProviderContext;
  serverlessCommand: string;
  serverlessOptions: Record<string, string | boolean>;
  print?: (data: string) => void;
  logTitle?: string;
}

export async function execServerlessCommand(params: ExecServerlessCommandParams): Promise<void> {
  const {
    tb, service, providerContext, serverlessCommand, serverlessOptions, print, logTitle,
  } = params;

  const serviceDir = service.dirPath;

  const templatePath = path.relative(serviceDir, await service.getServerlessTemplateFilePath());

  const extendedServerlessOptions = {
    ...serverlessOptions,
    "--config": templatePath,
    "--stage": service.context.stage,
    "--verbose": true,
  };

  const serverlessOptionList = Object.entries(extendedServerlessOptions).map(
    ([key, value]) => {
      if (typeof value === "boolean") {
        return value ? `${key} ` : "";
      } else {
        return `${key} "${value}" `;
      }
    },
  ).join("");

  const isDeploying = serverlessCommand.includes("deploy");
  const slsCmd = `sls ${serverlessCommand} ${serverlessOptionList}`.trimRight();

  function log(msg: string, raw = false): void {
    tb.log(msg, logTitle, raw, print);
  }

  await runHook({
    hookName: HookName.Setup,
    service,
    providerContext,
    log,
    async: print !== undefined,
  });

  log(chalk`Running Serverless Command: "{blue ${slsCmd}}"`);
  log(chalk`In Serverless Directory: "{blue ${path.relative(process.cwd(), serviceDir)}}"`);

  const command = `npx --no-install ${slsCmd}`;

  const providerEnv = getProviderEnv(providerContext, service);

  await bufferedExec({
    cwd: service.dirPath,
    env: { ...process.env, ...providerEnv },
    command,
    async: print !== undefined,
    log: (data: string) => { log(data, true); },
  });

  if (isDeploying) {
    await runHook({
      hookName: HookName.PostDeploy,
      service,
      providerContext,
      log,
      async: print !== undefined,
    });
  }
}
