import {AwsServiceDefinition, AwsServiceHookContext} from "serverless-service-framework";

export const service = new AwsServiceDefinition(
  __dirname,
  {
    name: "0b",
    shortName: "0b",

    importMap: {
      "0a": ["abc", "abd"],
    },

    exportMap: {},

    template: {},
  },
);

service.addHooks({
  setup: async (context: AwsServiceHookContext): Promise<void> => {
    const importMap = await context.service.getDirectImportValues("abc", "abd");
    context.log(JSON.stringify(importMap));
  },
});
