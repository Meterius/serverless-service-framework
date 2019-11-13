// @ts-ignore
import { FrameworkSchema } from "serverless-service-framework";

export default new FrameworkSchema({
  name: "Cquenz Backend",
  shortName: "cqz-be",

  serviceRootDir: "services",

  template: {
    provider: {
      name: "aws",
      region: "eu-central-1",
    }
  }
});
