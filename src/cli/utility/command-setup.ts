import { TB } from "../cli-types";
import { getFrameworkSchemaOption, requireStageOption } from "./common-options";
import { setupProvider } from "./provider-configuration";
import { FrameworkContext } from "../../framework/classes/framework-context";
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
