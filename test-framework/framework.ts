import { FrameworkSchemaProperties, ImportType } from "serverless-service-framework";

export const schema: FrameworkSchemaProperties = {
  name: "Test Backend",
  shortName: "cqz-be",

  serviceRootDir: "services",

  importSettings: {
    defaultImportType: ImportType.Direct,
  },

  template: {
    provider: {
      name: "aws",
      region: "eu-central-1",
    }
  }
};
