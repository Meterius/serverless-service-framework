import chalk from "chalk";
import path from "path";
import { CliError } from "./exceptions";
import {
  Framework, Service, ServiceHookContext, ServiceHookMap,
} from "../../framework/provider-definition";

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

async function preHookExecutionTrigger(hookName: keyof ServiceHookMap, context: ServiceHookContext): Promise<void> {
  context.log(chalk`Executing Hook "{blue ${hookName.toString()}}"`, false);
}

async function preHookExecutionSkipTrigger(hookName: keyof ServiceHookMap, context: ServiceHookContext): Promise<void> {
  context.log(chalk`Hook "{blue ${hookName.toString()}}" not set, skipping execution...`, false);
}

export async function executeHook(
  service: Service,
  hookName: keyof ServiceHookMap,
  baseContext: { async: boolean; log: (data: string, raw: boolean) => void },
): Promise<void> {
  await service.runHook(
    hookName, baseContext,
    preHookExecutionTrigger,
    preHookExecutionSkipTrigger,
  );
}

export async function executeServerlessCommand(
  service: Service,
  command: string,
  options: Record<string, string | boolean>,
  log: (data: string, raw: boolean) => void,
  async: boolean,
): Promise<void> {
  await service.executeServerlessCommand(
    command, options, log, async,
    async (extendedServerlessCommand: string) => {
      log(chalk`Running Serverless Command: "{blue ${extendedServerlessCommand}}"`, false);
      log(
        chalk`In Serverless Directory: "{blue ${path.relative(process.cwd(), service.dirPath)}}"`,
        false,
      );
    },
    preHookExecutionTrigger, preHookExecutionSkipTrigger,
  );
}
