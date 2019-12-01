import { AwsServiceDefinition, AwsService } from "serverless-service-framework";

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
              BucketName: "some-test-bucket-0a"
            }
          }
        },
      }
    },
  },
);

service.addHooks( {
  setup: async (service: AwsService, log: (data: string) => void) => {
    log("This is the Service 0A Setup Hook");
  },
  preRemove: async (service: AwsService, log: (data: string) => void) => {
    const stack = await service.retrieveStack();

    if(stack !== undefined) {
      const buckets = await stack.emptyAllBuckets();

      buckets.forEach(
        (bucket: string) => log(`Bucket "${bucket}" has been emptied`)
      );
    }
  },
});
