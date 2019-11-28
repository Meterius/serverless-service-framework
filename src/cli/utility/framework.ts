import { CliError } from "./exceptions";
import { Framework, Service } from "../../framework/provider-definition";

export function getService(
  fr: Framework,
  serviceIdentifier: string,
): Service {
  const sFile = fr.getService(serviceIdentifier);

  if (sFile === undefined) {
    throw new CliError(`Service "${serviceIdentifier}" not found`);
  } else {
    return sFile;
  }
}
