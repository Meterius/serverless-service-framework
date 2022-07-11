export type ServerlessProviderName = "aws";

export const serverlessProviderNames: string[] = ["aws"];

export interface FrameworkTemplate {
  // framework template cannot have the service name specified
  service?: {
    name?: undefined;

    [key: string]: unknown;
  };

  provider: {
    name?: undefined;
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
}

export interface ServiceTemplate {
  service?: never;

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
  service?: never;

  custom?: {
    imports?: undefined;

    [key: string]: unknown;
  };

  provider: {
    name?: undefined;
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
  service?: never;

  custom: {
    imports?: undefined;

    [key: string]: unknown;
  };

  provider: {
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
  service: string;

  custom: {
    imports?: undefined;

    [key: string]: unknown;
  };

  provider: {
    name: ServerlessProviderName;
    region: string;
    profile: string | undefined;

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
  service: string;

  custom: {
    imports: Record<string, unknown>;

    [key: string]: unknown;
  };

  provider: {
    name: ServerlessProviderName;
    region: string;
    profile: string | undefined;

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
  service: string;

  custom: {
    imports: Record<string, unknown>;

    [key: string]: unknown;
  };

  provider: {
    name: ServerlessProviderName;
    region: string;
    profile: string | undefined;

    stage: string;
    stackName: string;

    [key: string]: unknown;
  };

  [key: string]: unknown;
};

// OUTPUT

export type PostCompilationServerlessTemplate = ServerlessTemplatePostExports;

export type ServerlessTemplate = PostCompilationServerlessTemplate;
