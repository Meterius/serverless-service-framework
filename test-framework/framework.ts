import { AwsFrameworkDefinition } from "serverless-service-framework";

export const framework = new AwsFrameworkDefinition(__dirname, {
  name: "Test Backend",
  shortName: "sff-test",

  importSettings: {
    defaultImportType: "direct",
  },

  template: {
    provider: {
      region: "eu-central-1",
    }
  }
});

framework.addServiceDefinitionRoot(
  "services", true,
);
