import { pathExists } from "fs-extra";
import { GC, TB } from "../cli-types";
import {
  applyFrameworkOptionOptions, getFrameworkDefinitionOption,
  getFrameworkOptionsOption, getProfileOption, requireStageOption,
} from "./common-options";
import { CliError } from "./exceptions";
import {
  getFrameworkDefinitionFilePath,
  getFrameworkOptionsFilePath, loadFrameworkDefinitionFile,
  loadFrameworkOptionsFile,
} from "../../framework";
import { createFramework } from "../../framework/framework";
import { Framework, ServiceHookMap } from "../../framework/provider-definition";
import { requireVariadicParameters } from "./options-handling";
import { filterDuplicates } from "../../common/utility";
import { getService } from "./framework";

/**
 * Retrieves framework using common options.
 */
export async function setupFrameworkContextFunction(
  tb: TB,
): Promise<Framework> {
  const defFilePath = getFrameworkDefinitionOption(tb);
  const optFilePath = getFrameworkOptionsOption(tb);

  const frDefPath = defFilePath || (await getFrameworkDefinitionFilePath(process.cwd()));

  if (frDefPath === undefined) {
    throw new CliError("No framework definition file exists in current directory");
  } else if (
    defFilePath !== undefined && !(await pathExists(defFilePath))
  ) {
    throw new CliError(
      `Specified framework definition file "${defFilePath}" does not exist`,
    );
  }

  const frOptPath = optFilePath || (await getFrameworkOptionsFilePath(process.cwd()));

  if (frOptPath === undefined) {
    throw new CliError("No framework options file exists in current directory");
  } else if (
    optFilePath !== undefined && !(await pathExists(optFilePath))
  ) {
    throw new CliError(
      `Specified framework options file "${optFilePath}" does not exist`,
    );
  }

  const frOpts = applyFrameworkOptionOptions(
    tb, await loadFrameworkOptionsFile(frOptPath),
  );

  const stage = requireStageOption(tb, frOpts);
  const profile = getProfileOption(tb, frOpts);

  const frDef = await loadFrameworkDefinitionFile(frDefPath, frOpts);

  return createFramework(frDef, frOpts, stage, profile);
}

export function createHookCommand(hookName: keyof ServiceHookMap): GC {
  return {
    name: hookName,
    description: `Executes "${hookName}" hook`,
    run: async (tb: TB): Promise<void> => {
      const framework = await setupFrameworkContextFunction(tb);

      const [...serviceIds] = requireVariadicParameters(tb, "service-name");

      const services = serviceIds.length === 0 ? framework.services
        : filterDuplicates(serviceIds.map((id) => getService(framework, id)));

      for (let i = 0; i < services.length; i += 1) {
        const service = services[i];

        const log = (
          msg: string, raw: boolean,
        ): void => tb.log(msg, `${hookName} ${service.name}`, raw);

        await service.executeHook(hookName, log);
      }
    },
  };
}
