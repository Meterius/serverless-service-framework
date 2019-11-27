import { ServiceContext } from "serverless-service-framework";
import path from "path";

import { dummy } from "@r/dummy";

export async function setup(service: ServiceContext): Promise<void> {
  console.log(path.join("as", "dc" + dummy.toString()));
}

export async function postDeploy(service: ServiceContext): Promise<void> {
  console.log(service.name + "deploy");
}
