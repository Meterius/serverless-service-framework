import aws from "aws-sdk";

import { TB } from "../cli-types";
import { CliError } from "./exceptions";
import { FrameworkContext } from "../../framework/classes/framework-context";
import { getProfileOption } from "./common-options";
import { ServerlessProviderName, ServiceContext } from "../../framework";

export interface ProviderContext {
  tb: TB;
  ctx: FrameworkContext;
  profile?: string;
  provider: ServerlessProviderName;
}

export type ProviderEnvironment = Record<string, string | undefined>;

function getAwsProviderEnvironment(context: ProviderContext, region: string): ProviderEnvironment {
  return {
    AWS_REGION: region,
    AWS_PROFILE: context.profile,
  };
}

function setupAwsProvider(profile?: string): void {
  process.env.AWS_SDK_LOAD_CONFIG = "true";

  if (profile) {
    process.env.AWS_PROFILE = profile;
  }

  const credentials = new aws.SharedIniFileCredentials({
    profile: process.env.AWS_PROFILE,
  });

  aws.config.update({
    credentials,
    region: process.env.AWS_REGION,
  });
}

export async function setupProvider(tb: TB, ctx: FrameworkContext): Promise<ProviderContext> {
  const { provider } = ctx.schema;

  const profile = getProfileOption(tb, ctx.schema.options);

  switch (provider) {
    default:
      throw new CliError(`Unknown Provider "${provider}"`);

    case "aws":
      setupAwsProvider(profile);
      break;
  }

  return {
    profile, provider, tb, ctx,
  };
}

export function getProviderEnv(
  context: ProviderContext, service: ServiceContext,
): ProviderEnvironment {
  const { region } = service;

  switch (context.provider) {
    default:
      throw new CliError(`Unknown Provider "${context.provider}"`);

    case "aws":
      return getAwsProviderEnvironment(context, region);
  }
}
