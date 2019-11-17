import {ImportType, ServiceSchema} from "serverless-service-framework";
import template from "./serverless-template";

export default new ServiceSchema({
  name: "databases",
  shortName: "dbs",

  importMap: {
    "functions": ["a"],
  },

  exportMap: {
    "b": "asdasd",
  },

  template,
})
