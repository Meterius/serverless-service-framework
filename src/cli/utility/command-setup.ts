import { TB } from "../cli-types";
import { getFrameworkSchemaOption, requireStageOption } from "./common-options";
import { setupProvider } from "./provider-configuration";
import { FrameworkContext } from "../../framework/classes/framework-context";
import { ServiceContext } from "../../framework/classes/service-context";
import { CliError } from "./exceptions";
import { loadFrameworkContext } from "./framework";

export interface FrameworkContextSetup {
  context: FrameworkContext;
}

/**
 * Retrieves framework context using common options
 * and sets up the provider. (Used for commands operating on the complete framework context)
 * Returns necessary options and context.
 */
export async function setupFrameworkContextFunction(
  tb: TB,
): Promise<FrameworkContextSetup> {
  const stage = requireStageOption(tb);
  const filePath = getFrameworkSchemaOption(tb);

  const context = await loadFrameworkContext(filePath, stage);
  await setupProvider(tb, context);

  return {
    context,
  };
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
