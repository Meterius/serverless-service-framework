import { ServerlessProvider } from "../types";

export interface InlineFrameworkTemplate {
  // framework template cannot have the service name specified
  service?: {
    name?: never;
    [key: string]: any;
  };

  provider: {
    // framework requires a provider and region used for all services by default
    // note that provider name cannot be overwritten by service templates
    name: ServerlessProvider; // currently only aws is supported
    region: string;

    stage?: never; // cannot set stage in template
    stackName?: never; // cannot be used, since services cannot share a stack name

    [key: string]: any;
  };

  [key: string]: any;
}
