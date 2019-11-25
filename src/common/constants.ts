// service schema names and extensions searched for in service directories
export const serviceSchemaNames = ["service"];
export const serviceSchemaExtensions = ["ts"];

// framework schema names and extensions searched for in framework directory
export const frameworkSchemaNames = ["framework"];
export const frameworkSchemaExtensions = ["ts"];

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
