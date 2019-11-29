import { mkdirp, writeFile } from "fs-extra";
import path from "path";
import {
  APD, BaseParameter,
  Framework, Service, ServiceHook, ServiceHookMap, ServiceSchema, ServiceSchemaProperties,
  Stack,
} from "./abstract-provider-definition";
import {
  PostCompilationServerlessTemplate,
  PreCompilationServerlessTemplate, ServerlessProviderName,
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
import { AbstractBase } from "./abstract-base";

export enum ServerlessTemplateFormat {
  JavaScript = "js"
}

export interface SerializedServerlessTemplate {
  data: string;
  format: ServerlessTemplateFormat;
}

export abstract class AbstractService<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  readonly dirPath: string;

  readonly framework: Framework<D>;

  private __serverlessTemplate: ServerlessTemplate | null = null;

  readonly schema: ServiceSchema<D>;

  readonly hookMap: ServiceHookMap<D>;

  protected constructor(
    base: BaseParameter<D>,
    framework: Framework<D>,
    props: ServiceSchemaProperties<D>,
    dirPath: string,
    hookMap: ServiceHookMap<D>,
  ) {
    super(base);

    this.dirPath = dirPath;
    this.hookMap = hookMap;
    this.framework = framework;

    this.schema = new this.classes.ServiceSchema(this.framework.schema, props);
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
    return this.framework.services.filter(
      (otherService) => this.schema.isImporting(otherService.schema),
    );
  }

  get exportedToServices(): Service<D>[] {
    return this.framework.services.filter(
      (otherService) => this.schema.isExportedTo(otherService.schema),
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

  private retrieveStack(): Promise<Stack<D> | undefined> {
    return this.framework.provider.retrieveServiceStack(this);
  }

  private getStack(): Promise<Stack<D>> {
    return this.framework.provider.getServiceStack(this);
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

  private getTemplateProviderName(): ServerlessProviderName {
    return this.framework.provider.name;
  }

  private getTemplateProviderProfile(): string | undefined {
    return this.framework.profile;
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

        name: this.getTemplateProviderName(),
        profile: this.getTemplateProviderProfile(),
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
    hook: ServiceHook<D>,
    log: (data: string, raw: boolean) => void,
  ): Promise<void> {
    await hook(this, (data: string, raw = false) => log(data, raw));
  }

  async createExecutableServerlessCommand(
    command: string,
    options: Record<string, boolean | string>,
  ): Promise<string> {
    const serviceDir = this.dirPath;

    const templatePath = path.relative(serviceDir, await this.createServerlessTemplateFilePath());

    const extendedServerlessOptions: Record<string, string | boolean> = {
      ...options,
      "--verbose": true,
      "--config": templatePath,
    };

    const serverlessOptionList = Object.entries(extendedServerlessOptions).map(
      ([key, value]) => {
        if (typeof value === "boolean") {
          return value ? `${key} ` : "";
        } else {
          return `${key} "${value}" `;
        }
      },
    ).join("");

    return `sls ${command} ${serverlessOptionList}`.trimRight();
  }

  async executeExecutableServerlessCommand(
    executableServerlessCommand: string,
    log: (data: string, raw: boolean) => void,
    async: boolean,
    hookExecutor: (
      service: Service<D>,
      hookName: keyof ServiceHookMap<D>,
      log: (data: string, raw: boolean) => void
    ) => Promise<void>,
    preExecutionTrigger: () => void,
  ): Promise<void> {
    const isDeploying = executableServerlessCommand.startsWith("sls deploy");
    const isRemoving = executableServerlessCommand.startsWith("sls remove");

    const logR = (data: string): void => log(data, true);

    await hookExecutor(this, "setup", log);

    if (isDeploying) {
      await hookExecutor(this, "preDeploy", log);
    }

    if (isRemoving) {
      await hookExecutor(this, "preRemove", log);
    }

    const fullCommand = `npx --no-install ${executableServerlessCommand}`;

    preExecutionTrigger();

    await bufferedExec({
      cwd: this.dirPath,
      env: { ...process.env },
      command: fullCommand,
      log: logR,
      async,
    });

    if (isDeploying) {
      await hookExecutor(this, "postDeploy", log);
    }

    if (isRemoving) {
      await hookExecutor(this, "postRemove", log);
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
  async createServerlessTemplateFilePath(): Promise<string> {
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
