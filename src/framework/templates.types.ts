export type ServerlessProviderName = "aws";

export const serverlessProviderNames: string[] = ["aws"];

export type InlineFrameworkTemplate = {
  // framework template cannot have the service name specified
  service?: {
    name?: undefined;

    [key: string]: unknown;
  };

  provider: {
    // framework requires a provider and region used for all services by default
    // note that provider name cannot be overwritten by service templates
    name: ServerlessProviderName; // currently only aws is supported
    region: string;

    stage?: undefined; // cannot set stage in template
    stackName?: undefined; // cannot be used, since services cannot share a stack name

    [key: string]: unknown;
  };

  custom?: {
    imports?: undefined; // used for import values

    [key: string]: unknown;
  };

  resources?: {
    [key: string]: unknown;
  };

  [key: string]: unknown;
};

export interface InlineServiceTemplate {
  service?: {
    name?: undefined; // is generated by framework
    [key: string]: unknown;
  };

  provider?: {
    name?: undefined; // cannot overwrite framework setting
    region?: string; // may overwrite framework region

    stage?: undefined; // cannot set stage in template
    stackName?: undefined; // cannot set stack name

    [key: string]: any;
  };

  custom?: {
    imports?: undefined; // used for import values

    [key: string]: unknown;
  };

  resources?: {
    [key: string]: unknown;
  };

  [key: string]: unknown;
}

// TEMPLATE PROCESSING
// TODO: properly refactor interfaces to actually transform the previous one

// INPUT

export type PreCompilationServerlessTemplate = {};

// STEP 1

export type ServerlessTemplatePreMerging = PreCompilationServerlessTemplate;

export type ServerlessTemplatePostMerging = {
  service?: {
    name?: undefined;
    [key: string]: unknown;
  };

  custom?: {
    imports?: undefined;

    [key: string]: unknown;
  };

  provider: {
    name: ServerlessProviderName;
    region: string;

    stage?: undefined;
    stackName?: undefined;

    [key: string]: unknown;
  };

  resources?: {
    [key: string]: unknown;
  };

  [key: string]: unknown;
};

// STEP 2

export type ServerlessTemplatePrePreparation = ServerlessTemplatePostMerging;

export type ServerlessTemplatePostPreparation = {
  service: {
    name?: undefined;
    [key: string]: unknown;
  };

  custom: {
    imports?: undefined;

    [key: string]: unknown;
  };

  provider: {
    name: ServerlessProviderName;
    region: string;

    stage?: undefined;
    stackName?: undefined;

    [key: string]: unknown;
  };

  resources: {
    [key: string]: unknown;
  };

  [key: string]: unknown;
};

// STEP 3

export type ServerlessTemplatePreNaming = ServerlessTemplatePostPreparation;

export type ServerlessTemplatePostNaming = {
  service: {
    name: string;
    [key: string]: unknown;
  };

  custom: {
    imports?: undefined;

    [key: string]: unknown;
  };

  provider: {
    name: ServerlessProviderName;
    region: string;

    stage: string;
    stackName: string;

    [key: string]: unknown;
  };

  resources: {
    [key: string]: unknown;
  };

  [key: string]: unknown;
};

// STEP 4

export type ServerlessTemplatePreImports = ServerlessTemplatePostNaming;

export type ServerlessTemplatePostImports = {
  service: {
    name: string;
    [key: string]: unknown;
  };

  custom: {
    imports: Record<string, unknown>;

    [key: string]: unknown;
  };

  provider: {
    name: ServerlessProviderName;
    region: string;

    stage: string;
    stackName: string;

    [key: string]: unknown;
  };

  resources: {
    [key: string]: unknown;
  };

  [key: string]: unknown;
};

// STEP 5

export type ServerlessTemplatePreExports = ServerlessTemplatePostImports;

export type ServerlessTemplatePostExports = {
  service: {
    name: string;
    [key: string]: unknown;
  };

  custom: {
    imports: Record<string, unknown>;

    [key: string]: unknown;
  };

  provider: {
    name: ServerlessProviderName;
    region: string;

    stage: string;
    stackName: string;

    [key: string]: unknown;
  };

  [key: string]: unknown;
};

// OUTPUT

export type PostCompilationServerlessTemplate = ServerlessTemplatePostExports;

export type ServerlessTemplate = PostCompilationServerlessTemplate;
