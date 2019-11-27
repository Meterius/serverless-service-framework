import { TB } from "../cli-types";
import {
  getFrameworkOptionsOption, getFrameworkSchemaOption,
} from "./common-options";
import { ProviderContext, setupProvider } from "./provider-configuration";
import { FrameworkContext } from "../../framework/classes/framework-context";
import { loadFrameworkContext } from "./framework";

export interface FrameworkContextSetup {
  context: FrameworkContext;
  providerContext: ProviderContext;
}

/**
 * Retrieves framework context using common options
 * and sets up the provider. (Used for commands operating on the complete framework context)
 * Returns necessary options and context.
 */
export async function setupFrameworkContextFunction(
  tb: TB,
): Promise<FrameworkContextSetup> {
  const filePath = getFrameworkSchemaOption(tb);
  const optsFilePath = getFrameworkOptionsOption(tb);

  const context = await loadFrameworkContext(tb, filePath, optsFilePath);
  const providerContext = await setupProvider(tb, context);

  return {
    context,
    providerContext,
  };
}
