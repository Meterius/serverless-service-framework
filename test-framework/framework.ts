import { AwsFrameworkDefinition } from "serverless-service-framework";

export const framework = new AwsFrameworkDefinition(__dirname, {
  name: "Test Backend",
  shortName: "cqz-be",

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
