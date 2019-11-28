import { AwsServiceDefinition, AwsService } from "serverless-service-framework";

export default new AwsServiceDefinition({
    name: "0a",
    shortName: "0a",

    importMap: {},

    exportMap: {
      "0a": "output-0a",
    },

    template: {},
  },
  __dirname,
  {
    setup: async (service: AwsService, log: (data: string) => void) => {
      log("This is the Service 0A Setup Hook");
    }
  }
);

