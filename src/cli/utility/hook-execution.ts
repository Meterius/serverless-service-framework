import { titleCase } from "change-case";
import { ServiceContext } from "../../framework/classes/service-context";
import { isObject } from "../../common/type-guards";
import { findMatchingFile } from "../../common/filesystem";
import { serviceHookExtensions, serviceHookNames } from "../../common/constants";
import { loadTypescriptModules } from "../../common/module-loading";
import { FrameworkContext } from "../../framework/classes";
import { ProviderContext } from "./provider-configuration";

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
  providerContext: ProviderContext,
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
  providerContext: ProviderContext,
  log?: (msg: string) => void,
): Promise<void> {
  return runHook(
    service, providerContext, "prePackage", log,
  );
}

export function runPostDeploy(
  service: ServiceContext,
  providerContext: ProviderContext,
  log?: (msg: string) => void,
): Promise<void> {
  return runHook(
    service, providerContext, "postDeploy", log,
  );
}
