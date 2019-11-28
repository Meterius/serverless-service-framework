import chalk from "chalk";
import path from "path";
import { CliError } from "./exceptions";
import { Framework, Service, ServiceHookMap } from "../../framework/provider-definition";

export function getService(
  fr: Framework,
  serviceIdentifier: string,
): Service {
  const sFile = fr.getService(serviceIdentifier);

  if (sFile === undefined) {
    throw new CliError(`Service "${serviceIdentifier}" not found`);
  } else {
    return sFile;
  }
}

export async function executeHook(
  service: Service,
  hookName: keyof ServiceHookMap,
  log: (data: string, raw: boolean) => void,
): Promise<void> {
  const hook = service.hookMap[hookName];

  if (hook === undefined) {
    log(chalk`Hook "{blue ${hookName.toString()}}" not set, skipping execution...`, false);
  } else {
    log(chalk`Executing Hook "{blue ${hookName.toString()}}"`, false);
    await service.executeHook(
      hook, (data: string, raw: boolean) => log(chalk`{white ({blue ${hookName}}):} ${data}`, raw),
    );
  }
}

export async function executeServerlessCommand(
  service: Service,
  command: string,
  options: Record<string, string | boolean>,
  log: (data: string, raw: boolean) => void,
  async: boolean,
): Promise<void> {
  const execCmd = await service.createExecutableServerlessCommand(command, options);

  log(chalk`Running Serverless Command: "{blue ${execCmd}}"`, false);
  log(
    chalk`In Serverless Directory: "{blue ${path.relative(process.cwd(), service.dirPath)}}"`,
    false,
  );

  await service.executeExecutableServerlessCommand(
    execCmd,
    log,
    async,
    executeHook,
  );
}
