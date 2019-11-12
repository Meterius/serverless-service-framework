const { FrameworkSchema } = require("serverless-service-framework");

module.exports = new FrameworkSchema({
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
