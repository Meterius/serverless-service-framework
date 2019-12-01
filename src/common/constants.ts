// service definition names and extensions searched for in service directory
export const serviceDefinitionNames = ["service"];
export const serviceDefinitionExtensions = ["ts"];

export const serviceDefinitionExportProperty = "service";

// framework definition names and extensions searched for in framework directory
export const frameworkDefinitionNames = ["framework"];
export const frameworkDefinitionExtensions = ["ts"];

export const frameworkDefinitionExportProperty = "framework";

// framework options names and extensions searched for in framework directory
export const frameworkOptionsNames = ["framework-options"];
export const frameworkOptionsExtensions = ["js"];

// where locally build service files are put in service directories
export const serviceBuildDir = ".serverless-service";

// names of files build in service build directory
export const serviceBuild = {
  serverlessTemplate: "serverless-template",
};

// service hook names and extensions searched for in service directories
export const serviceHookNames = ["service-hooks"];
export const serviceHookExtensions = ["ts"];
