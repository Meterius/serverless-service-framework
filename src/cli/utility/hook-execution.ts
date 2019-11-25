import { titleCase } from "change-case";
import { ServiceContext } from "../../framework/classes/service-context";
import { isObject } from "../../common/type-guards";
import { findMatchingFile } from "../../common/filesystem";
import { serviceHookExtensions, serviceHookNames } from "../../common/constants";
import { GC, TB } from "../cli-types";
import { setupFrameworkContextFunction } from "./command-setup";
import { requireVariadicParameters } from "./options-handling";
import { filterDuplicates } from "../../common/utility";
import { getService } from "./framework";
import { loadTypescriptModules } from "../../common/module-loading";
import { FrameworkContext } from "../../framework/classes";

async function loadHookFile(
  absoluteHookFilePath: string,
  hookName: string,
  context: FrameworkContext,
): Promise<((service: ServiceContext) => Promise<void>) | undefined> {
  const file = (await loadTypescriptModules(
    [absoluteHookFilePath], context.schema.options,
  ))[0];

  const fileExport = isObject(file) && file[hookName];

  if (fileExport instanceof Function || fileExport === undefined) {
    // @ts-ignore
    return fileExport;
  } else {
    throw new Error(
      `In hook module "${absoluteHookFilePath}" the hook "${hookName}" is not a function`,
    );
  }
}

/**
 * Runs a service hook.
 * @param service - the service the hook is run on
 * @param hookName - the name of the hook
 * @param log - optionally prints out whether hook is being executed or not
 */
async function runHook(
  service: ServiceContext,
  hookName: string,
  log: (msg: string) => void = (): void => {},
): Promise<void> {
  const hookPath = await findMatchingFile(service.dirPath, serviceHookNames, serviceHookExtensions);
  const hookFunc = hookPath !== undefined
    && await loadHookFile(hookPath, hookName, service.context);

  if (hookFunc === undefined || hookFunc === false || hookPath === undefined) {
    log(`${titleCase(hookName)} Hook not found, skipping execution...`);
  } else {
    log(`Executing ${titleCase(hookName)} Hook...`);
    await hookFunc(service);
  }
}

export function runPrePackage(
  service: ServiceContext,
  log?: (msg: string) => void,
): Promise<void> {
  return runHook(
    service, "prePackage", log,
  );
}

export function runPostDeploy(
  service: ServiceContext,
  log?: (msg: string) => void,
): Promise<void> {
  return runHook(
    service, "postDeploy", log,
  );
}

type HookFunc = (service: ServiceContext, log: (msg: string) => void) => Promise<void>;

export function createHookCommand(hookName: string, hookFunc: HookFunc): GC {
  return {
    name: hookName,
    description: `Executes "${hookName}" hook`,
    run: async (tb: TB): Promise<void> => {
      const { context } = await setupFrameworkContextFunction(tb);

      const [...serviceIds] = requireVariadicParameters(tb, "service-name");

      const services = serviceIds.length === 0 ? context.services
        : filterDuplicates(serviceIds.map((id) => getService(context, id)));

      for (let i = 0; i < services.length; i += 1) {
        const service = services[i];

        await hookFunc(service, (msg: string) => {
          tb.log(msg, `${hookName} ${service.name}`);
        });
      }
    },
  };
}
