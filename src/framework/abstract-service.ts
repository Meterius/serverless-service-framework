import {
  mkdirp, writeFile, readFile,
} from "fs-extra";
import path from "path";
import {
  APD, BaseParameter,
  Framework, Service, ServiceHook, ServiceHookMap, ServiceSchema, ServiceSchemaProperties,
  Stack,
} from "./abstract-provider-definition";
import {
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

/**
 * Class to define the representation of a loaded Service
 * It implements the serverless template construction
 * It provides information about the service and an endpoint to retrieve the associated stack
 */
export abstract class AbstractService<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  readonly dirPath: string;

  readonly framework: Framework<D>;

  readonly schema: ServiceSchema<D>;

  readonly hookMap: ServiceHookMap<D>;

  private __cachedServerlessTemplate: ServerlessTemplate | null = null;

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

  // name of the service
  get name(): string {
    return this.schema.name;
  }

  // stack name of the service stack when deployed
  get stackName(): string {
    return `${this.framework.schema.shortName}-${this.schema.shortName}-${this.framework.stage}`;
  }

  // region the service stack will be deployed in
  get region(): string {
    return (this.schema.template.provider || {}).region
      || this.framework.schema.template.provider.region;
  }

  /*
   * Dependency Data
   */

  // services that are imported by this service
  get importedServices(): Service<D>[] {
    return this.framework.services.filter(
      (otherService) => this.schema.isImporting(otherService.schema),
    );
  }

  // services that import this service
  get exportedToServices(): Service<D>[] {
    return this.framework.services.filter(
      (otherService) => this.schema.isExportedTo(otherService.schema),
    );
  }

  // whether this service imports the other service
  importsService(otherService: Service<D>): boolean {
    return this.importedServices.includes(otherService);
  }

  // whether the other service imports this service
  exportedToService(otherService: Service<D>): boolean {
    return this.exportedToServices.includes(otherService);
  }

  /*
   * Service Stack Data
   */

  // loads the service stack, returns it if deployed, undefined otherwise
  retrieveStack(): Promise<Stack<D> | undefined> {
    return this.framework.provider.retrieveServiceStack(this);
  }

  // loads the service stack, returns it if deployed, throws otherwise
  getStack(): Promise<Stack<D>> {
    return this.framework.provider.getServiceStack(this);
  }

  /*
   * Serverless Template Methods
   */

  /**
   * Builds serverless template and returns it.
   * Note: it caches if ignoreCache is false
   */
  async getServerlessTemplate(ignoreCache = false): Promise<ServerlessTemplate> {
    if (this.__cachedServerlessTemplate === null || ignoreCache) {
      this.__cachedServerlessTemplate = await this.buildServiceServerlessTemplateInMemory();
    }

    return this.__cachedServerlessTemplate;
  }

  /**
   * Builds serverless template and writes it to disk.
   * Returns the file path of the written template file.
   * Note: caches template built if ignoreCache is false
   */
  async createServerlessTemplateFilePath(ignoreCache = false): Promise<string> {
    const template = await this.getServerlessTemplate(ignoreCache);

    return this.writeSerializedServerlessTemplate(template);
  }

  /*
   * Service Directory Management
   */

  // returns absolute file path of file path relative to the service directory
  resolveServicePath(relPath: string): string {
    return path.join(this.dirPath, relPath);
  }

  /**
   * Returns data of file at file path relative to the service directory.
   * Returns undefined if the file does not exist.
   */
  async retrieveServiceFile(relPath: string): Promise<string | undefined> {
    try {
      return (await readFile(this.resolveServicePath(relPath))).toString();
    } catch (err) {
      if (err.code === "ENOENT") {
        return undefined;
      } else {
        throw err;
      }
    }
  }

  /**
   * Returns data of file at file path relative to the service directory.
   * Throws if file does not exist.
   */
  async getServiceFile(relPath: string): Promise<string> {
    const data = await this.retrieveServiceFile(relPath);

    if (data === undefined) {
      throw new Error(`Service File "${relPath}" in Service "${this.name}" not found`);
    } else {
      return data;
    }
  }

  /**
   * Writes file at file path relative to the service directory.
   * Note: It will create necessary sub directories if the file
   * is contained in one that does not exist yet
   */
  async writeServiceFile(relPath: string, data: string | Buffer): Promise<void> {
    const filePath = this.resolveServicePath(relPath);
    await mkdirp(path.dirname(filePath));

    await writeFile(relPath, data);
  }

  /*
   * PRIVATE
   */

  /*
   * Template Specific Data Retrieval
   */

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

  /*
   * Service Build Directory Management
   */

  private getServiceBuildDir(): string {
    return this.resolveServicePath(serviceBuildDir);
  }

  private resolveServiceBuildPath(relPath: string): string {
    return path.join(this.getServiceBuildDir(), relPath);
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

  /*
   * Template Processing
   */

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

  /*
   * Serverless Template Building
   */

  /**
   * Builds serverless template and returns it.
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
   * Writes serverless template to service build directory.
   * Returns absolute file path of written template file.
   */
  private writeSerializedServerlessTemplate(
    serverlessTemplate: ServerlessTemplate,
  ): Promise<string> {
    const data = `module.exports = ${JSON.stringify(serverlessTemplate, undefined, " ")};`;

    return this.writeServiceBuildFile(
      `${serviceBuild.serverlessTemplate}.js`,
      data,
    );
  }

  /*
   * Service Hook and Serverless Command Methods
   */

  // TODO: refactor execution methods

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
}
