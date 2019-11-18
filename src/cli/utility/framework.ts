import { pathExists } from "fs-extra";
import chalk from "chalk";
import { execSync } from "child_process";
import path from "path";
import { FrameworkContext } from "../../framework/classes/framework-context";
import { FrameworkSchemaFile } from "../../framework/classes/framework-schema-file";
import { CliError } from "./exceptions";
import { ServiceContext } from "../../framework/classes/service-context";
import { execAsync } from "../../common/os";
import { TB } from "../cli-types";

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
    serverlessTemplateFilePath: await service.getServerlessTemplateFilePath(),
  };
}

export async function execServerlessCommand(
  tb: TB,
  service: ServiceContext,
  serverlessCommand: string,
  serverlessOptions: Record<string, string | boolean>,
  print?: (data: string) => void,
): Promise<void> {
  const serviceDir = service.dirPath;

  const templatePath = path.relative(serviceDir, await service.getServerlessTemplateFilePath());

  const extendedServerlessOptions = {
    ...serverlessOptions,
    "--config": templatePath,
    "--stage": service.context.stage,
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

  const slsCmd = `sls ${serverlessCommand} ${serverlessOptionList}`.trimRight();

  function log(msg: string, raw = false): void {
    tb.log(msg, undefined, raw, print);
  }

  log(chalk`Running Serverless Command: "{blue ${slsCmd}}"`);
  log(chalk`In Serverless Directory: "{blue ${path.relative(process.cwd(), serviceDir)}}"`);

  const command = `npx --no-install ${slsCmd}`;


  if (print) {
    const [err, stdout, stderr] = await execAsync(command, {
      cwd: service.dirPath,
      env: { ...process.env, AWS_REGION: service.region },
    });

    log(stdout, true);
    log(chalk`{red ${stderr}}`, true);

    if (err) {
      throw err;
    }
  } else {
    execSync(command, {
      cwd: service.dirPath,
      env: { ...process.env, AWS_REGION: service.region },
      stdio: "inherit",
    });
  }
}
