import { FrameworkSchemaProperties } from "serverless-service-framework";

export const schema: FrameworkSchemaProperties = {
  name: "Test Backend",
  shortName: "cqz-be",

  serviceRootDir: "services",

  importSettings: {
    defaultImportType: "direct",
  },

  template: {
    provider: {
      name: "aws",
      region: "eu-central-1",
    }
  }
};
