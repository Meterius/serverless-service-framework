import { TB } from "../cli-types";
import { ServerlessProvider } from "../../framework/types";
import { CliError } from "./exceptions";
import { requireOption } from "./options";
import { FrameworkContext } from "../../framework/classes/framework-context";

function setupAwsProviderConfig(profile: string, region?: string): void {
  process.env.AWS_SDK_LOAD_CONFIG = "true";
  process.env.AWS_PROFILE = profile;

  if (region) {
    process.env.AWS_REGION = region;
  }
}

export async function setupAwsProvider(tb: TB): Promise<void> {
  const profile = requireOption(tb, "profile", "p");
  setupAwsProviderConfig(profile);
}

export async function setupProvider(tb: TB, ctx: FrameworkContext): Promise<void> {
  const { provider } = ctx.schema;

  switch (provider) {
    default:
      throw new CliError(`Unknown Provider "${provider}"`);

    case ServerlessProvider.AWS:
      await setupAwsProvider(tb);
      break;
  }
}
