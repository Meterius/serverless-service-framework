import chalk from "chalk";
import { setupFrameworkContextFunction } from "./command-setup";
import { TB } from "../cli-types";
import { getParallelFlag } from "./common-options";
import { requireVariadicParameters } from "./options-handling";
import { filterDuplicates } from "../../common/utility";
import { Framework, Service } from "../../framework/provider-definition";
import { executeServerlessCommand, getService } from "./framework";

const { hrtime } = process;

interface PerformEnvironment {
  tb: TB;
  framework: Framework;
  performingServices: Service[];
  actionTitle: string;
  actionServerlessCommand: string | undefined;
  actionDependenciesReversed: boolean;
  actPres: string;
  actPast: string;
  skipServiceIfNotDeployed: boolean;
}

function cap(str: string): string {
  return str.length > 0 ? str[0].toUpperCase() + str.substr(1) : "";
}

function joinC(arr: string[]): string {
  return `[${arr.join(", ")}]`;
}

function joinCQ(arr: string[], clr: string | undefined = "blue"): string {
  return joinC(arr.map((str) => (clr ? chalk`"{${clr} ${str}}"` : `"${str}"`)));
}

function createLogTitle(env: PerformEnvironment, service?: Service): string {
  return chalk`{blue ${env.actionTitle}${service ? ` "${service.name}"` : ""}}`;
}

function createLog(
  env: PerformEnvironment,
  service?: Service,
  print?: (msg: string) => void,
): (msg: string) => void {
  return (msg: string): void => {
    env.tb.log(msg, createLogTitle(env, service), false, print);
  };
}

async function performService(
  service: Service, env: PerformEnvironment, print?: (msg: string) => void,
): Promise<void> {
  const {
    actPres, actPast, actionServerlessCommand, tb, skipServiceIfNotDeployed,
  } = env;

  const log = createLog(env, service, print);

  log(chalk`${cap(actPres)} "{blue ${service.name}}" in region "{blue ${service.region}}"`);

  if (skipServiceIfNotDeployed) {
    const exists = await service.framework.provider.isServiceDeployed(service);

    if (!exists) {
      log(chalk`{green Skipped "{blue ${service.name}}" (since it is not deployed)}`);
      return;
    }
  }

  const startTime = hrtime();

  function slsLog(msg: string, raw = false): void {
    tb.log(msg, createLogTitle(env, service), raw, print);
  }

  if (actionServerlessCommand) {
    await executeServerlessCommand(
      service,
      actionServerlessCommand,
      {},
      slsLog,
      print !== undefined,
    );
  }

  const endTimeInSec = hrtime(startTime)[0].toString(10);

  log(chalk`{green ${cap(actPast)} "{blue ${service.name}}" ({blue ${endTimeInSec} seconds})}`);
}

async function performParallel(env: PerformEnvironment): Promise<void> {
  const {
    tb, framework, performingServices, actPast, actPres, actionDependenciesReversed,
  } = env;

  const log = createLog(env);

  interface Task {
    service: Service;
    outputReference: { output: string };
    promise: Promise<[Service, undefined | Error]>;
  }

  const tasks: Task[] = [];
  const failedTasks: Task[] = [];

  const performedServices = framework.actionLogic.getPerformedServices(performingServices);

  while (
    (
      framework.actionLogic.getNotPerformedServices(performedServices).length > 0
      && failedTasks.length === 0
    ) || (
      tasks.length > 0
    )
  ) {
    // get all services that could be performed and are not currently being performed
    const possible = framework.actionLogic.getAllPerformable(
      performedServices, actionDependenciesReversed,
    ).filter((service) => !tasks.map((task) => task.service).includes(service));

    // if no service failed and there are services to perform add them
    if (possible.length > 0 && failedTasks.length === 0) {
      tasks.push(
        ...possible.map((service: Service): Task => {
          const outputReference = {
            output: "",
          };

          return {
            service,
            // output from the service is redirected to a string buffer
            outputReference,
            // perform service and resolve with the error instead of
            // rejecting to simplify handling with Promise.race
            promise: new Promise<[Service, Error | undefined]>((resolve) => {
              performService(
                service, env, (msg: string) => { outputReference.output += msg; },
              ).then(() => {
                resolve([service, undefined]);
              }, (err) => {
                resolve([service, err]);
              });
            }),
          };
        }),
      );
    }

    const remaining = framework.actionLogic.getNotPerformedServices(performedServices)
      .filter((service) => !tasks.some((task) => task.service === service))
      .map((service) => service.name);

    log(`${cap(actPres)} ${joinCQ(tasks.map((task) => task.service.name))}`);
    log(chalk`Remaining services are ${joinCQ(remaining)}`);

    // wait for the next task to finish
    const [finishedService, error] = await Promise.race(tasks.map((task) => task.promise));

    // identify and remove the task that finished
    const finishedTask = tasks.splice(
      tasks.findIndex((task) => task.service.name === finishedService.name), 1,
    )[0];

    if (error === undefined) {
      performedServices.push(finishedService);

      let execLog = chalk`\n##### START OF LOG "{green ${finishedService.name}}" #####\n`;
      execLog += `${finishedTask.outputReference.output}`;
      execLog += chalk`##### END OF LOG "{green ${finishedService.name}}" #####\n\n`;
      tb.log(execLog, undefined, true);
    } else {
      let execLog = chalk`\n##### START OF ERROR "{red ${finishedService.name}}" #####\n`;
      execLog += `${error}\n`;
      execLog += chalk`##### END OF ERROR "{red ${finishedService.name}}" #####\n\n`;
      tb.log(execLog, undefined, true);

      let infoMsg = chalk`"{blue ${finishedService.name}}" has encountered an error,`;
      infoMsg += " the output will be emitted after all remaining services currently";
      infoMsg += ` being ${actPast} have been finished`;
      log(chalk`{red ${infoMsg}}`);

      failedTasks.push(finishedTask);
    }

    if (failedTasks.length > 0) {
      let infoMsg = "Since an error has been encountered the services currently";
      infoMsg += ` being ${actPast} will be ${actPast} and no more will be queued`;
      log(chalk`{red ${infoMsg}}`);
    }
  }

  if (failedTasks.length > 0) {
    failedTasks.forEach((task) => {
      let execLog = chalk`\n##### START OF LOG "{red ${task.service.name}}" #####\n`;
      execLog += `${task.outputReference.output}\n`;
      execLog += chalk`##### END OF LOG "{red ${task.service.name}}" #####\n\n`;

      tb.log(execLog, undefined, true);
    });

    const notDeployedServices = framework.actionLogic.getNotPerformedServices(performedServices)
      .map((service) => service.name);
    const deployedServices = performedServices.filter(
      (service) => performingServices.includes(service),
    ).map((service) => service.name);
    const failedServices = failedTasks.map((task) => task.service.name);

    log(`${cap(actPast)} services are ${joinCQ(deployedServices, "green")}`);
    log(chalk`Not ${cap(actPast)} services are ${joinCQ(notDeployedServices, "red")}`);
    log(chalk`{red ${cap(actPres)} services ${joinCQ(failedServices, "red")} failed}`);

    throw new Error(`services ${joinCQ(failedServices, undefined)} encountered errors`);
  }
}

async function performSequential(env: PerformEnvironment): Promise<void> {
  const {
    framework, actPast, actPres, performingServices, actionDependenciesReversed,
  } = env;

  const log = createLog(env);

  const order = framework.actionLogic.getTotalSequentialOrder(actionDependenciesReversed)
    .filter((service) => performingServices.includes(service));

  for (let i = 0; i < order.length; i += 1) {
    const service = order[i];

    try {
      await performService(service, env);
    } catch (err) {
      const notDeployed = order.slice(i).map((s) => s.name);
      const deployed = order.slice(0, i).map((s) => s.name);
      const serviceName = service.name;

      log(chalk`{red ${cap(actPres)} service "${serviceName}" failed}`);
      log(chalk`${cap(actPast)} services are ${joinCQ(deployed, "green")}`);
      log(chalk`Not ${actPast} services are ${joinCQ(notDeployed, "red")}`);

      throw err;
    }
  }
}

interface MultiServiceCommandOptions {
  actionTitle: string;
  actionPhrases: { presentContinuous: string; pastSimple: string };
  actionServerlessCommand: string | undefined;
  actionDependenciesReversed?: boolean;
  skipServiceIfNotDeployed?: boolean;
}

export function createMultiServiceCommandRun({
  actionTitle,
  actionPhrases,
  actionServerlessCommand,
  actionDependenciesReversed = false,
  skipServiceIfNotDeployed = false,
}: MultiServiceCommandOptions): (tb: TB) => Promise<void> {
  return async function cmd(tb: TB): Promise<void> {
    // ENVIRONMENT SETUP

    const framework = await setupFrameworkContextFunction(tb);

    const [...serviceIds] = requireVariadicParameters(tb, "service-name");

    const performingServices = serviceIds.length === 0 ? framework.services
      : filterDuplicates(serviceIds.map((id) => getService(framework, id)));

    const parallel = getParallelFlag(tb);

    const actPres = actionPhrases.presentContinuous;
    const actPast = actionPhrases.pastSimple;

    const env: PerformEnvironment = {
      tb,
      performingServices,
      actPast,
      actPres,
      framework,
      actionServerlessCommand,
      actionTitle,
      actionDependenciesReversed,
      skipServiceIfNotDeployed,
    };

    // EXECUTION

    const log = createLog(env);

    log(`${cap(actPres)} Services ${joinCQ(performingServices.map((s) => s.schema.name))}`);
    log(`Stage: "{blue ${framework.stage}}"`);

    const startTime = hrtime();

    if (parallel) {
      await performParallel(env);
    } else {
      await performSequential(env);
    }

    const endTimeInSec = hrtime(startTime)[0].toString(10);

    log(chalk`{green Finished ${cap(actPres)} ({blue ${endTimeInSec} seconds}) }`);
  };
}
