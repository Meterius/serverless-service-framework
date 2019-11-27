import { titleCase } from "change-case";
import { ServiceContext } from "../../framework/classes/service-context";
import { isObject } from "../../common/type-guards";
import { findMatchingFile } from "../../common/filesystem";
import { serviceHookExtensions, serviceHookNames } from "../../common/constants";
import { loadTypescriptModules, setupServiceTsNodeViaEnv } from "../../common/module-loading";
import { FrameworkContext } from "../../framework/classes";
import { getProviderEnv, ProviderContext } from "./provider-configuration";
import { bufferedExec } from "./buffered-exec";
import { GC, TB } from "../cli-types";
import { setupFrameworkContextFunction } from "./command-setup";
import { requireVariadicParameters } from "./options-handling";
import { filterDuplicates } from "../../common/utility";
import { getService } from "./framework";

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
  Setup = "setup", // run before any command
  PostDeploy = "postDeploy", // run after completely deployed
}

export interface RunHookParams {
  hookName: HookName; // name of hook to be executed
  service: ServiceContext; // service the hook is executed on
  providerContext: ProviderContext; // provider context used to set environment variables

  // passed to buffered exec (raw meaning no line-ending or formatting to be applied)
  log: (data: string, raw: boolean) => void;
  async: boolean;
}

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

export function createHookCommand(hookName: HookName): GC {
  return {
    name: hookName,
    description: `Executes "${hookName}" hook`,
    run: async (tb: TB): Promise<void> => {
      const { context, providerContext } = await setupFrameworkContextFunction(tb);

      const [...serviceIds] = requireVariadicParameters(tb, "service-name");

      const services = serviceIds.length === 0 ? context.services
        : filterDuplicates(serviceIds.map((id) => getService(context, id)));

      for (let i = 0; i < services.length; i += 1) {
        const service = services[i];

        await runHook({
          service,
          hookName,
          providerContext,

          async: false,
          log: (msg: string, raw: boolean) => {
            tb.log(msg, `${hookName} ${service.name}`, raw);
          },
        });
      }
    },
  };
}
