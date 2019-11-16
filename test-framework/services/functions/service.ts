import { ServiceSchema } from "serverless-service-framework";
import template from "./serverless-template";

export default new ServiceSchema({
  name: "functions",
  shortName: "fcts",

  exportMap: {
    "a": "",
  },

  template,
})
