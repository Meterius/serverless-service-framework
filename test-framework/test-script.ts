import {AwsFramework} from "../src/framework/aws";

export async function run(framework: AwsFramework) {
  console.log(framework.stage);
}
