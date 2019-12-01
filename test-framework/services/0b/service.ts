import {AwsServiceDefinition} from "serverless-service-framework";

export const service = new AwsServiceDefinition(
  __dirname,
  {
    name: "0b",
    shortName: "0b",

    importMap: {
      "0a": ["0a"],
    },

    exportMap: {},

    template: {},
  },
);

