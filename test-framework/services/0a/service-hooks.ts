import { ServiceContext } from "serverless-service-framework";

export async function prePackage(service: ServiceContext): Promise<void> {
  console.log(service.name);
}

export async function postDeploy(service: ServiceContext): Promise<void> {
  console.log(service.name + "deploy");
}
