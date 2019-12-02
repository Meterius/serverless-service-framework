import {
  mkdirp, writeFile,
} from "fs-extra";
import path from "path";
import { ExecOptions } from "child_process";
import {
  APD, BaseParameter,
  Framework, Service, ServiceHook, ServiceHookContext, ServiceHookMap, ServiceSchema, ServiceSchemaProperties,
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
import { AbstractBaseWithFsLocation } from "./abstract-base-with-fs-location";

/**
 * Class to define the representation of a loaded Service
 * It implements the serverless template construction
 * It provides information about the service and an endpoint to retrieve the associated stack
 */
export abstract class AbstractService<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBaseWithFsLocation<D> {
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
    super(base, dirPath, "Service");

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
   * Service Hook and Serverless Command Methods
   */

  /**
   * Executes a command as a child process with the current environment inherited and the service dir as cwd.
   * Via the options the default cwd and env can be overwritten.
   * The command will buffer the output if async is set to true and print it via the log function.
   * This is the function intended to be used by service hooks in order to execute commands properly when
   * the hook is executed in parallel (asynchronously). The asyncParams can be assigned the context parameter directly.
   * @param command - Command executed
   * @param asyncParams - If async is true stdio is inherited otherwise the log function is used to print
   * @param options - Options for exec
   */
  async execute(
    command: string,
    asyncParams: { async: true; log: (data: string, raw: boolean) => void } | { async: false } = { async: false },
    options: ExecOptions = {},
  ): Promise<void> {
    const log = asyncParams.async
      ? (data: string): void => asyncParams.log(data, true) : (data: string): void => { process.stdout.write(data); };

    await bufferedExec({
      command,
      options: { cwd: this.dirPath, env: { ...process.env }, ...options },

      log,
      async: asyncParams.async,
    });
  }

  /**
   * Runs a hook of the service.
   * @param hookName - Name of the hook to be executed
   * @param baseContext - Required parameters for the hook
   * @param preExecutionTrigger - Trigger function that if the hook is set, is executed before the hook is executed
   * @param preExecutionSkipTrigger - Trigger function that if the hook is not set, is executed
   * @returns Whether the hook exists i.e. whether it was executed
   */
  async runHook(
    hookName: keyof ServiceHookMap<D>,
    baseContext: { async: boolean; log: (data: string, raw: boolean) => void },
    preExecutionTrigger: (hookName: keyof ServiceHookMap<D>, context: ServiceHookContext<D>) => Promise<void>
    = async (): Promise<void> => {},
    preExecutionSkipTrigger: (hookName: keyof ServiceHookMap<D>, context: ServiceHookContext<D>) => Promise<void>
    = async (): Promise<void> => {},
  ): Promise<boolean> {
    const context = {
      ...baseContext,
      service: this,
      log: (data: string, raw = false): void => baseContext.log(data, raw),
    };

    const hook: ServiceHook<D> | undefined = this.hookMap[hookName];

    if (hook !== undefined) {
      await preExecutionTrigger(hookName, context);

      await hook(context);

      return true;
    } else {
      await preExecutionSkipTrigger(hookName, context);

      return false;
    }
  }

  /**
   * Execute a serverless command.
   * Will build the template and run hooks if necessary.
   * @param serverlessCommand - Serveress Command to be executed
   * @param serverlessOptions - Serverless CLI arguments where boolean values are used as flag arguments
   * @param log - Log function output is printed to (note that if async is false, exec will print directly to console)
   * @param hookLogGen - Generator for the log functions given to runHook calls
   * @param async - Whether this is executed parallel i.e. whether output will be buffered and only printed with log
   * @param preServerlessExecutionTrigger - Trigger run before the serverless command is executed
   * @param preHookExecutionTrigger - Trigger given to runHook (works as specified there)
   * @param preHookExecutionSkipTrigger - Trigger given to runHook (works as specified there)
   */
  async executeServerlessCommand(
    serverlessCommand: string,
    serverlessOptions: Record<string, boolean | string>,
    log: (data: string, raw: boolean) => void
    // eslint-disable-next-line no-console
    = (data: string, raw: boolean): void => { if (raw) { process.stdout.write(data); } else { console.log(data); } },
    hookLogGen: (hookName: keyof ServiceHookMap<D>) => (data: string, raw: boolean) => void
    = (): (data: string, raw: boolean) => void => log,
    async = false,
    preServerlessExecutionTrigger: (extendedServerlessCommand: string) => Promise<void>
    = async (): Promise<void> => {},
    preHookExecutionTrigger: (hookName: keyof ServiceHookMap<D>, context: ServiceHookContext<D>) => Promise<void>
    = async (): Promise<void> => {},
    preHookExecutionSkipTrigger: (hookName: keyof ServiceHookMap<D>, context: ServiceHookContext<D>) => Promise<void>
    = async (): Promise<void> => {},
  ): Promise<void> {
    const runHook = async (hookName: keyof ServiceHookMap<D>): Promise<void> => {
      await this.runHook(hookName, {
        async, log: hookLogGen(hookName),
      }, preHookExecutionTrigger, preHookExecutionSkipTrigger);
    };

    const serviceDir = this.dirPath;

    const templatePath = path.relative(serviceDir, await this.createServerlessTemplateFilePath());

    const extendedServerlessOptions: Record<string, string | boolean> = {
      ...serverlessOptions,
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

    const slsCmd = `sls ${serverlessCommand} ${serverlessOptionList}`.trimRight();

    const isDeploying = slsCmd.startsWith("sls deploy ");
    const isRemoving = slsCmd.startsWith("sls remove ");

    const logR = (data: string): void => log(data, true);

    await runHook("setup");

    if (isDeploying) {
      await runHook("preDeploy");
    }

    if (isRemoving) {
      await runHook("preRemove");
    }

    const fullCommand = `npx --no-install ${slsCmd}`;

    await preServerlessExecutionTrigger(slsCmd);

    await this.execute(fullCommand, { async, log: logR });

    if (isDeploying) {
      await runHook("postDeploy");
    }

    if (isRemoving) {
      await runHook("postRemove");
    }
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
    return this.resolvePath(serviceBuildDir);
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
}
