import { AwsFrameworkDefinition } from "serverless-service-framework";

import service0a from "@services/0a/service";
import service0b from "@services/0b/service";
import service0c from "@services/0c/service";
import service0d from "@services/0d/service";
import service1a from "@services/1a/service";
import service1b from "@services/1b/service";
import service2a from "@services/2a/service";

export const framework = new AwsFrameworkDefinition({
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
}, [
  service0a,
  service0b,
  service0c,
  service0d,
  service1a,
  service1b,
  service2a,
]);
