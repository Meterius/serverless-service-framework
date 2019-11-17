// @ts-ignore
import {FrameworkSchema, ImportType} from "serverless-service-framework";

export default new FrameworkSchema({
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
});
