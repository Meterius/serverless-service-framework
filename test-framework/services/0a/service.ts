import { AwsServiceDefinition, AwsServiceHookContext } from "serverless-service-framework";

export const service = new AwsServiceDefinition(__dirname, {
  name: "0a",
  shortName: "0a",

  importMap: {},

  exportMap: {
    "0a": "output-0a",
  },

  template: {
    resources: {
      Resources: {
        TestBucket: {
          Type: "AWS::S3::Bucket",
          Properties: {
            BucketName: "some-test-bucket-0a",
          },
        },
      },
    },
  },
});

service.addHooks({
  setup: async (context: AwsServiceHookContext) => {
    await context.service.execute("echo Hello Test", context);

    const ssfEnvKeys = Object.keys(process.env).filter(key => key.startsWith("SSF_CLI"));
    const ssfEnv: Record<string, string | undefined> = {};

    ssfEnvKeys.forEach((key: string) => {
      ssfEnv[key] = process.env[key];
    });

    context.log(JSON.stringify(ssfEnv, undefined, " ") + "\n", true);
  },
  preRemove: async (context: AwsServiceHookContext) => {
    const stack = await context.service.retrieveStack();

    if (stack !== undefined) {
      const buckets = await stack.emptyAllBuckets();

      buckets.forEach(
        (bucket: string) => context.log(`Bucket "${bucket}" has been emptied`),
      );
    }
  },
});
