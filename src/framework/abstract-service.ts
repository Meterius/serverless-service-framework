import { mkdirp, writeFile } from "fs-extra";
import path from "path";
import chalk from "chalk";
import { titleCase } from "change-case";
import {
  APD,
  Framework, Service, ServiceHookMap, ServiceSchema,
  ServiceSchemaClass, ServiceSchemaProperties,
} from "./abstract-provider-definition";
import {
  PostCompilationServerlessTemplate,
  PreCompilationServerlessTemplate,
  ServerlessTemplate, ServerlessTemplatePostExports, ServerlessTemplatePostImports,
  ServerlessTemplatePostMerging,
  ServerlessTemplatePostNaming,
  ServerlessTemplatePostPreparation, ServerlessTemplatePreExports,
  ServerlessTemplatePreImports,
  ServerlessTemplatePreMerging,
  ServerlessTemplatePreNaming,
  ServerlessTemplatePrePreparation,
} from "./templates";
import { serviceBuild, serviceBuildDir } from "../common/constants";
import { merge } from "../common/utility";
import { AbstractServiceSchema } from "./abstract-service-schema";
import { bufferedExec } from "../common/buffered-exec";

export enum ServerlessTemplateFormat {
  JavaScript = "js"
}

export interface SerializedServerlessTemplate {
  data: string;
  format: ServerlessTemplateFormat;
}

export abstract class AbstractService<
  D extends APD, // AbstractProviderDefinition
> {
  public readonly dirPath: string;

  public readonly framework: Framework<D>;

  private readonly __importedServices: ServiceSchema<D>[];

  private readonly __exportedToServices: ServiceSchema<D>[];

  private __serverlessTemplate: ServerlessTemplate | null = null;

  public readonly schema: ServiceSchema<D>;

  public readonly hookMap: ServiceHookMap<D>;

  private readonly props: ServiceSchemaProperties<D>;

  protected constructor(
    serviceSchemaClass: ServiceSchemaClass<D>,
    framework: Framework<D>,
    props: ServiceSchemaProperties<D>,
    dirPath: string,
    hookMap: ServiceHookMap<D>,
  ) {
    this.dirPath = dirPath;
    this.props = props;
    this.hookMap = hookMap;
    // eslint-disable-next-line new-cap
    this.schema = new serviceSchemaClass(
      framework.schema, props,
    );

    this.framework = framework;

    const {
      importedServices, exportedToServices,
    } = this.computeLocalizedServicesDependencies(
      this.props, framework.serviceSchemas,
    );

    this.__exportedToServices = exportedToServices;
    this.__importedServices = importedServices;
  }

  get name(): string {
    return this.schema.name;
  }

  get stackName(): string {
    return `${this.framework.schema.shortName}-${this.schema.shortName}-${this.framework.stage}`;
  }

  get region(): string {
    return (this.schema.template.provider || {}).region
      || this.framework.schema.template.provider.region;
  }

  get importedServices(): Service<D>[] {
    return this.__importedServices.map(
      (schema) => this.framework.referenceService(schema.identifier),
    );
  }

  get exportedToServices(): Service<D>[] {
    return this.__exportedToServices.map(
      (schema) => this.framework.referenceService(schema.identifier),
    );
  }

  /**
   * Writes file into service build directory and creates necessary directories.
   * Returns absolute file path of written file.
   */
  private async writeServiceBuildFile(
    relPath: string,
    fileData: string,
  ): Promise<string> {
    const filePath = this.resolveServiceBuildPath(relPath);

    await mkdirp(path.dirname(filePath));
    await writeFile(filePath, fileData);

    return filePath;
  }

  /**
   * Writes serialized serverless template to service build directory.
   * Returns absolute file path of written template file.
   */
  private writeSerializedServerlessTemplate(
    serializedTemplate: SerializedServerlessTemplate,
  ): Promise<string> {
    return this.writeServiceBuildFile(
      `${serviceBuild.serverlessTemplate}.${serializedTemplate.format}`,
      serializedTemplate.data,
    );
  }

  private getTemplateServiceName(): string {
    return `${this.framework.schema.shortName}-${this.schema.shortName}`;
  }

  private getTemplateProviderStackName(): string {
    return this.stackName;
  }

  private getTemplateProviderStage(): string {
    return this.framework.stage;
  }

  private async processServiceServerlessTemplateMerging(
    template: ServerlessTemplatePreMerging,
  ): Promise<ServerlessTemplatePostMerging> {
    const templateWithFramework = merge(
      template,
      this.framework.schema.template,
    );

    return merge(
      templateWithFramework,
      this.schema.template,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private async processServiceServerlessTemplatePreparation(
    template: ServerlessTemplatePrePreparation,
  ): Promise<ServerlessTemplatePostPreparation> {
    return {
      ...template,
      service: template.service || {},
      custom: template.custom || {},
      resources: template.resources || {},
    };
  }

  private async processServiceServerlessTemplateNaming(
    template: ServerlessTemplatePreNaming,
  ): Promise<ServerlessTemplatePostNaming> {
    return {
      ...template,
      service: {
        ...template.service,
        name: this.getTemplateServiceName(),
      },

      provider: {
        ...template.provider,
        stage: this.getTemplateProviderStage(),
        stackName: this.getTemplateProviderStackName(),
      },
    };
  }

  private async processServiceServerlessTemplateImports(
    template: ServerlessTemplatePreImports,
  ): Promise<ServerlessTemplatePostImports> {
    const { provider, schema: { options } } = this.framework;

    const { importMap } = this.schema;
    const importedServices = Object.keys(importMap);

    const importValueMap: Record<string, unknown> = {};

    for (let i = 0; i < importedServices.length; i += 1) {
      const importedServiceName = importedServices[i];
      const importedService = this.framework.getService(importedServiceName);

      if (importedService === undefined) {
        throw new Error(
          `Service "${this.schema.name}" imports non-existent service "${importedServiceName}"`,
        );
      }

      const importedValues = importMap[importedServiceName];

      const directImportedValues = AbstractServiceSchema.filterImportValuesByType(
        importedValues, "direct",
      );

      if (directImportedValues.length > 0) {
        const stubValue = options.stubDirectImports;

        if (stubValue === undefined) {
          const directImportData = await provider.prepareTemplateDirectImports(
            this, importedService,
          );

          directImportedValues.forEach((importValue) => {
            importValueMap[importValue.name] = provider.retrieveTemplateDirectImportValue(
              this, importedService, importValue, directImportData,
            );
          });
        } else {
          directImportedValues.forEach((importValue) => {
            importValueMap[importValue.name] = stubValue;
          });
        }
      }

      const providerBasedImportedValues = AbstractServiceSchema.filterImportValuesByType(
        importedValues, "provider-based",
      );

      if (providerBasedImportedValues.length > 0) {
        const providerBasedImportData = await provider.prepareTemplateProviderBasedImports(
          this, importedService,
        );

        providerBasedImportedValues.forEach((importValue) => {
          importValueMap[importValue.name] = provider.retrieveTemplateProviderBasedImportValue(
            this, importedService, importValue, providerBasedImportData,
          );
        });
      }
    }

    return {
      ...template,
      custom: {
        ...template.custom,
        imports: importValueMap,
      },
    };
  }

  private async processServiceServerlessTemplateExports(
    template: ServerlessTemplatePreExports,
  ): Promise<ServerlessTemplatePostExports> {
    const exportTemplateValueMap: Record<string, any> = {};

    const entries = Object.entries(this.schema.exportMap);
    for (let i = 0; i < entries.length; i += 1) {
      const [exportName, exportValue] = entries[i];

      exportTemplateValueMap[exportName] = this.framework.provider.retrieveTemplateExportValue(
        this, exportName, exportValue,
      );
    }

    return this.framework.provider.insertTemplateExportValues(
      this, exportTemplateValueMap, template,
    );
  }

  importsService(otherService: Service<D>): boolean {
    return this.importedServices.includes(otherService);
  }

  exportedToService(otherService: Service<D>): boolean {
    return this.exportedToServices.includes(otherService);
  }

  /**
   * Builds serverless template used for service.
   * Returns the built template. (caches built)
   */
  async getServerlessTemplate(): Promise<ServerlessTemplate> {
    if (this.__serverlessTemplate === null) {
      this.__serverlessTemplate = await this.buildServiceServerlessTemplateInMemory();
    }

    return this.__serverlessTemplate;
  }

  async executeHook(
    name: keyof ServiceHookMap<D>,
    log: (data: string, raw: boolean) => void,
  ): Promise<void> {
    const hook = this.hookMap[name];

    if (hook === undefined) {
      log(`${titleCase(name.toString())} hook not set, skipping execution...`, false);
    } else {
      log(`Executing ${titleCase(name.toString())} hook...`, false);
      // @ts-ignore
      await hook(this, log);
    }
  }

  async executeServerlessCommand(
    command: string,
    options: Record<string, boolean | string>,
    // eslint-disable-next-line @typescript-eslint/unbound-method,no-console
    log: (data: string, raw: boolean) => void,
    async: boolean,
  ): Promise<void> {
    const logD = (data: string, raw = false): void => log(data, raw);
    const logR = (data: string): void => log(data, true);

    const serviceDir = this.dirPath;

    const templatePath = path.relative(serviceDir, await this.getServerlessTemplateFilePath());

    const extendedServerlessOptions: Record<string, string | boolean> = {
      ...options,
      "--verbose": true,
      "--config": templatePath,
      "--stage": this.framework.stage,
      "--region": this.region,
    };

    if (this.framework.profile) {
      extendedServerlessOptions["--profile"] = this.framework.profile;
    }

    const serverlessOptionList = Object.entries(extendedServerlessOptions).map(
      ([key, value]) => {
        if (typeof value === "boolean") {
          return value ? `${key} ` : "";
        } else {
          return `${key} "${value}" `;
        }
      },
    ).join("");

    const isDeploying = command.includes("deploy");
    const slsCmd = `sls ${command} ${serverlessOptionList}`.trimRight();

    await this.executeHook("setup", log);

    logD(chalk`Running Serverless Command: "{blue ${slsCmd}}"`);
    logD(chalk`In Serverless Directory: "{blue ${path.relative(process.cwd(), serviceDir)}}"`);

    const fullCommand = `npx --no-install ${slsCmd}`;

    await bufferedExec({
      cwd: serviceDir,
      env: { ...process.env },
      command: fullCommand,
      log: logR,
      async,
    });

    if (isDeploying) {
      await this.executeHook("postDeploy", log);
    }
  }

  /**
   * Builds serverless template used for service.
   * Returns the built template.
   */
  private async buildServiceServerlessTemplateInMemory(

  ): Promise<ServerlessTemplate> {
    const step0: PreCompilationServerlessTemplate = {};
    const step1 = await this.processServiceServerlessTemplateMerging(step0);
    const step2 = await this.processServiceServerlessTemplatePreparation(step1);
    const step3 = await this.processServiceServerlessTemplateNaming(step2);
    const step4 = await this.processServiceServerlessTemplateImports(step3);
    const step5 = await this.processServiceServerlessTemplateExports(step4);

    return step5;
  }

  /**
   * Builds serverless template used for service and writes it to disk.
   * Returns the file path of the written template file. (caches built)
   */
  async getServerlessTemplateFilePath(): Promise<string> {
    const template = await this.getServerlessTemplate();
    const serializedTemplate = await AbstractService.serializeServiceServerlessTemplate(
      template, ServerlessTemplateFormat.JavaScript,
    );

    return this.writeSerializedServerlessTemplate(serializedTemplate);
  }

  /**
   * Serializes serverless template to supported file format.
   * Returns data and used format for the file.
   */
  private static async serializeServiceServerlessTemplate(
    template: PostCompilationServerlessTemplate, // which template will be serialized
    format: ServerlessTemplateFormat, // which file format will be generated
  ): Promise<SerializedServerlessTemplate> {
    if (format === ServerlessTemplateFormat.JavaScript) {
      return {
        data: `module.exports = ${JSON.stringify(template, undefined, " ")};`,
        format,
      };
    } else {
      throw new Error("Invalid Template Format");
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private computeLocalizedServicesDependencies(
    serviceSchema: ServiceSchema<D>, serviceSchemas: ServiceSchema<D>[],
  ): { importedServices: ServiceSchema<D>[]; exportedToServices: ServiceSchema<D>[] } {
    const importedServices = serviceSchemas.filter(
      (otherService) => serviceSchema.isImporting(otherService),
    );

    const exportedToServices = serviceSchemas.filter(
      (otherService) => serviceSchema.isExportedTo(otherService),
    );

    return {
      importedServices, exportedToServices,
    };
  }

  resolveServicePath(relPath: string): string {
    return path.join(this.dirPath, relPath);
  }

  getServiceBuildDir(): string {
    return this.resolveServicePath(serviceBuildDir);
  }

  protected resolveServiceBuildPath(relPath: string): string {
    return path.join(this.getServiceBuildDir(), relPath);
  }
}
