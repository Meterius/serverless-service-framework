import aws from "aws-sdk";

import { TB } from "../cli-types";
import { CliError } from "./exceptions";
import { FrameworkContext } from "../../framework/classes/framework-context";
import { getProfileOption } from "./common-options";

function setupAwsProviderConfig(profile?: string, region?: string): void {
  process.env.AWS_SDK_LOAD_CONFIG = "true";

  if (profile) {
    process.env.AWS_PROFILE = profile;
  }

  if (region) {
    process.env.AWS_REGION = region;
  }

  const credentials = new aws.SharedIniFileCredentials({
    profile: process.env.AWS_PROFILE,
  });

  aws.config.update({
    credentials,
    region: process.env.AWS_REGION,
  });
}

export async function setupAwsProvider(tb: TB): Promise<void> {
  const profile = getProfileOption(tb);
  setupAwsProviderConfig(profile);
}

export async function setupProvider(tb: TB, ctx: FrameworkContext): Promise<void> {
  const { provider } = ctx.schema;

  switch (provider) {
    default:
      throw new CliError(`Unknown Provider "${provider}"`);

    case "aws":
      await setupAwsProvider(tb);
      break;
  }
}
