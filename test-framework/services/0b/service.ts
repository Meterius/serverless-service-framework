import {AwsServiceDefinition, AwsServiceHookContext} from "serverless-service-framework";

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

service.addHooks({
  preDeploy: async (context: AwsServiceHookContext): Promise<void> => {
    const importMap = await context.service.getDirectImportValues("0a");
    context.log(JSON.stringify(importMap));
  },
});
