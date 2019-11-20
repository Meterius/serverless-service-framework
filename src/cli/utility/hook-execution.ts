import { pathExists } from "fs-extra";
import { titleCase } from "change-case";
import { ServiceContext } from "../../framework/classes/service-context";
import { requireModule } from "../../common/require";
import { isObject } from "../../common/type-guards";
import { findMatchingFile } from "../../common/filesystem";
import { serviceHookExtensions, serviceHookNames } from "../../common/constants";

function loadHookFile(
  absoluteHookFilePath: string, hookName: string,
): ((service: ServiceContext) => Promise<void>) | undefined {
  const file = requireModule(absoluteHookFilePath);
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
    && (await pathExists(hookPath))
    && loadHookFile(hookPath, hookName);

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
