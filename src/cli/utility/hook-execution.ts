import { titleCase } from "change-case";
import { ServiceContext } from "../../framework/classes/service-context";
import { isObject } from "../../common/type-guards";
import { findMatchingFile } from "../../common/filesystem";
import { serviceHookExtensions, serviceHookNames } from "../../common/constants";
import { loadTypescriptModules, setupServiceTsNodeViaEnv } from "../../common/module-loading";
import { FrameworkContext } from "../../framework/classes";
import { getProviderEnv, ProviderContext } from "./provider-configuration";
import { bufferedExec } from "./buffered-exec";

export interface HookEnv {
  SSF_HOOK_FRAMEWORK_CONTEXT: string;
  SSF_HOOK_SERVICE_ID: string;
  SSF_HOOK_NAME: string;
  SSF_HOOK_PATH: string;
}

async function existsHook(
  absoluteHookFilePath: string,
  hookName: string,
  context: FrameworkContext,
): Promise<boolean> {
  const file = (await loadTypescriptModules(
    [absoluteHookFilePath], context.schema.options,
  ))[0];

  return isObject(file) && file[hookName] !== undefined;
}

export enum HookName {
  Setup = "setup",
  PostDeploy = "postDeploy",
}

export interface RunHookParams {
  hookName: HookName;
  service: ServiceContext;
  providerContext: ProviderContext;

  log: (data: string, raw: boolean) => void;
  async: boolean;
}

/**
 * Runs a service hook.
 */
export async function runHook(params: RunHookParams): Promise<void> {
  const {
    service, providerContext, hookName, log, async,
  } = params;

  const hookPath = await findMatchingFile(service.dirPath, serviceHookNames, serviceHookExtensions);

  if (hookPath === undefined || !(await existsHook(hookPath, hookName, service.context))) {
    log(`${titleCase(hookName)} Hook not found, skipping execution...`, false);
  } else {
    const command = "node -e "
    + "\"require('serverless-service-framework/dist/cli/utility/hook-execution-bootstrap');\"";

    const hookEnv: HookEnv = {
      SSF_HOOK_FRAMEWORK_CONTEXT: FrameworkContext.serialize(service.context),
      SSF_HOOK_NAME: hookName,
      SSF_HOOK_SERVICE_ID: service.schema.identifier,
      SSF_HOOK_PATH: hookPath,
    };

    log(`Executing ${titleCase(hookName)} Hook...`, false);

    try {
      await bufferedExec({
        command,
        cwd: service.dirPath,
        env: {
          ...process.env,
          ...getProviderEnv(providerContext, service),
          ...setupServiceTsNodeViaEnv(service),
          TS_NODE_TRANSPILE_ONLY: "true", // since exists hook already type checks
          ...hookEnv,
        },
        async,
        log: (data: string) => {
          log(data, true);
        },
      });
    } catch (err) {
      throw new Error(`Executing Hook "${hookName}" on Service "${service.name}" failed`);
    }
  }
}
