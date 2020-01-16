import { GC, TB } from "../cli-types";
import {
  applyFrameworkOptionOptions, getFrameworkDefinitionOption,
  getFrameworkOptionsOption, getProfileOption, requireStageOption,
} from "./common-options";
import { CliError } from "./exceptions";
import { createFramework } from "../../framework/framework";
import { Framework, ServiceHookMap } from "../../framework/provider-definition";
import { requireVariadicParameters } from "./options-handling";
import { filterDuplicates } from "../../common/utility";
import { executeHook, getService } from "./framework";
import { getFrameworkDefinitionFilePath, loadFrameworkDefinitionFile } from "../../framework/framework-definition";
import {
  getFrameworkOptionsFilePath,
  loadFrameworkOptionsFile,
  NativeFrameworkOptions,
} from "../../framework/framework-options";

/**
 * Retrieves framework using common options.
 */
export async function setupFrameworkContextFunction(
  tb: TB,
  frameworkOptionsOverwrite: NativeFrameworkOptions = {},
): Promise<Framework> {
  const providedDefinitionFilePath = getFrameworkDefinitionOption(tb);
  const providedOptionsFilePath = getFrameworkOptionsOption(tb);

  const definitionFilePath = await getFrameworkDefinitionFilePath(
    providedDefinitionFilePath, process.cwd(),
  );

  if (definitionFilePath === undefined && providedDefinitionFilePath === undefined) {
    throw new CliError("No framework definition file exists in current directory");
  } else if (definitionFilePath === undefined) {
    throw new CliError(
      `Specified framework definition file "${providedDefinitionFilePath}" does not exist`,
    );
  }

  const optionFilePath = await getFrameworkOptionsFilePath(providedOptionsFilePath, process.cwd());

  if (optionFilePath === undefined && providedOptionsFilePath === undefined) {
    throw new CliError("No Framework Options file exists in current directory");
  } else if (optionFilePath === undefined) {
    throw new CliError(
      `Specified Framework Options file "${providedOptionsFilePath}" does not exist`,
    );
  }

  const frOpts = applyFrameworkOptionOptions(
    tb, { ...(await loadFrameworkOptionsFile(optionFilePath)), ...frameworkOptionsOverwrite },
  );

  const stage = requireStageOption(tb, frOpts);
  const profile = getProfileOption(tb, frOpts);

  const frDef = await loadFrameworkDefinitionFile(definitionFilePath, frOpts);

  return createFramework(frDef, frOpts, stage, profile);
}

export function createHookCommand(hookName: keyof ServiceHookMap): GC {
  return {
    name: hookName.toString(),
    description: `Executes "${hookName.toString()}" hook`,
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

        await executeHook(service, hookName, { async: false, log });
      }
    },
  };
}
