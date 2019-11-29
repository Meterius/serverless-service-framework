import {AwsServiceDefinition} from "serverless-service-framework";

export const service = new AwsServiceDefinition(
  __dirname,
  {
    name: "1b",
    shortName: "1b",

    importMap: {
      "1a": [],
    },

    exportMap: {},

    template: {},
  }
);

