import {AwsServiceDefinition} from "serverless-service-framework";

export default new AwsServiceDefinition(
  {
    name: "0b",
    shortName: "0b",

    importMap: {
      "0a": ["0a"],
    },

    exportMap: {},

    template: {},
  },
  __dirname
);

