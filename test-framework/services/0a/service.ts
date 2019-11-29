import { AwsServiceDefinition, AwsService } from "serverless-service-framework";

export const service = new AwsServiceDefinition(__dirname, {
    name: "0a",
    shortName: "0a",

    importMap: {},

    exportMap: {
      "0a": "output-0a",
    },

    template: {},
  },
);

service.addHooks( {
  setup: async (service: AwsService, log: (data: string) => void) => {
    log("This is the Service 0A Setup Hook");
  }
});
