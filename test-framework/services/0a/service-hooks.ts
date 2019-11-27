import { ServiceContext } from "serverless-service-framework";
import path from "path";

export async function setup(service: ServiceContext): Promise<void> {
  console.log(path.join("as", "dc"));
}

export async function postDeploy(service: ServiceContext): Promise<void> {
  console.log(service.name + "deploy");
}
