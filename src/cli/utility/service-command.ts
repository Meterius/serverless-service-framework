import chalk from "chalk";
import { getService, setupFrameworkContextFunction } from "./command-setup";
import { TB } from "../cli-types";
import { ServiceContext } from "../../framework/classes/service-context";
import { getParallelFlag } from "./common-options";
import { requireVariadicParameters } from "./options";
import { filterDuplicates } from "../../common/utility";
import { FrameworkContext } from "../../framework/classes/framework-context";
import { execServerlessCommand } from "./framework";

const { hrtime } = process;

interface PerformEnvironment {
  tb: TB;
  context: FrameworkContext;
  performingServices: ServiceContext[];
  actionTitle: string;
  actionServerlessCommand: string | undefined;
  actPres: string;
  actPast: string;
}

function cap(str: string): string {
  return str.length > 0 ? str[1].toUpperCase() + str.substr(1) : "";
}

function joinC(arr: string[]): string {
  if (arr.length >= 2) {
    return arr.slice(0, arr.length - 2).concat(
      [`${arr[arr.length - 2]} and ${arr[arr.length - 1]}`],
    ).join(", ");
  } else {
    return arr[0] || "";
  }
}

function joinCQ(arr: string[], clr: string | undefined = "blue"): string {
  return joinC(arr.map((str) => (clr ? chalk`"{${clr} ${str}}"` : `"${str}"`)));
}


async function performService(
  service: ServiceContext, env: PerformEnvironment, print?: (msg: string) => void,
): Promise<void> {
  const {
    actPres, actPast, actionServerlessCommand, tb, actionTitle,
  } = env;

  function log(msg: string): void {
    tb.log(msg, `${actionTitle} ${service.name}`, false, print);
  }

  log(chalk`${cap(actPres)} "{blue ${service.name}}" in region "{blue ${service.region}}"`);

  const startTime = hrtime();

  if (actionServerlessCommand) {
    await execServerlessCommand(
      tb, service, actionServerlessCommand, {}, print,
    );
  }

  const endTimeInSec = hrtime(startTime)[0].toString(10);

  log(chalk`{green ${cap(actPast)} "{blue ${service.name}}" ({blue ${endTimeInSec} seconds})}`);
}

async function performParallel(env: PerformEnvironment): Promise<void> {
  const {
    tb, context, performingServices, actionTitle, actPast, actPres,
  } = env;

  function log(msg: string): void {
    tb.log(msg, actionTitle);
  }

  interface Task {
    service: ServiceContext;
    output: string;
    promise: Promise<[ServiceContext, undefined | Error]>;
  }

  const tasks: Task[] = [];
  const failedTasks: Task[] = [];

  const performedServices = context.actionLogic.getPerformedServices(performingServices);

  while (
    (
      context.actionLogic.getNotPerformedServices(performedServices).length > 0
      && failedTasks.length === 0
    ) || (
      tasks.length > 0
    )
  ) {
    // get all services that could be performed and are not currently being performed
    const possible = context.actionLogic.getAllPerformable(performedServices)
      .filter((service) => !tasks.map((task) => task.service).includes(service));

    // if no service failed and there are services to perform add them
    if (possible.length > 0 && failedTasks.length === 0) {
      tasks.push(
        ...possible.map((service: ServiceContext): Task => {
          const task: Task = {
            service,
            // output from the service is redirected to a string buffer
            output: "",
            // perform service and resolve with the error instead of
            // rejecting to simplify handling with Promise.race
            promise: new Promise((resolve) => {
              performService(
                service, env, (msg: string) => { task.output += msg; },
              ).then(() => {
                resolve([service, undefined]);
              }, (err) => {
                resolve([service, err]);
              });
            }),
          };

          return task;
        }),
      );
    }

    const remaining = context.actionLogic.getNotPerformedServices(performedServices)
      .filter((service) => tasks.some((task) => task.service === service))
      .map((service) => service.name);

    log(`${cap(actPres)} ${joinCQ(tasks.map((task) => task.service.name))}`);
    log(chalk`Remaining services are ${joinCQ(remaining)}\n`);

    // wait for the next task to finish
    const [finishedService, error] = await Promise.race(tasks.map((task) => task.promise));

    // identify and remove the task that finished
    const finishedTask = tasks.splice(
      tasks.findIndex((task) => task.service.name === finishedService.name), 1,
    )[0];

    if (error === undefined) {
      performedServices.push(finishedService);

      let execLog = chalk`\n##### START OF LOG "{green ${finishedService.name}}" #####\n\n`;
      execLog += `${finishedTask.output}\n`;
      execLog += chalk`##### END OF LOG "{green ${finishedService.name}}" #####\n`;

      tb.log(execLog, undefined, true);
    } else {
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
      let execLog = chalk`\n##### START OF LOG "{red ${task.service.name}}" #####\n\n`;
      execLog += `${task.output}\n`;
      execLog += chalk`##### END OF LOG "{red ${task.service.name}}" #####\n`;

      tb.log(execLog, undefined, true);
    });

    const notDeployedServices = context.actionLogic.getNotPerformedServices(performedServices)
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
    context, actPast, actPres, performingServices, actionTitle, tb,
  } = env;

  function log(msg: string): void {
    tb.log(msg, actionTitle);
  }

  const order = context.actionLogic.getTotalSequentialOrder()
    .filter((service) => performingServices.includes(service));

  for (let i = 0; i < order.length; i += 1) {
    const service = order[i];

    try {
      await performService(service, env);
    } catch (err) {
      const notDeployed = order.slice(i).map((s) => chalk`{blue ${s.name}}`);
      const deployed = order.slice(0, i).map((s) => chalk`{blue ${s.name}}`);
      const serviceName = chalk`{blue ${service.name}}`;

      log(chalk`${cap(actPast)} services are ${joinCQ(deployed)}}`);
      log(chalk`Not ${actPast} services are ${joinCQ(notDeployed)}}`);
      log(chalk`{red ${cap(actPres)} service "${serviceName}" failed`);
    }
  }
}

export function createMultiServiceCommandRun(
  actionTitle: string,
  actionPhrases: { presentContinuous: string; pastSimple: string },
  actionServerlessCommand: string | undefined,
): (tb: TB) => Promise<void> {
  return async function cmd(tb: TB): Promise<void> {
    // ENVIRONMENT SETUP
    const { context } = await setupFrameworkContextFunction(tb);

    const [...serviceIds] = requireVariadicParameters(tb, "service-name");

    const performingServices = filterDuplicates(serviceIds.map((id) => getService(context, id)));

    const parallel = getParallelFlag(tb);

    // MESSAGE DISPLAY

    function log(msg: string): void {
      tb.log(msg, actionTitle);
    }

    // ACTION PHRASE ALIASES

    const actPres = actionPhrases.presentContinuous;
    const actPast = actionPhrases.pastSimple;

    // ACTION FUNCTIONS

    // EXECUTION

    log(`${cap(actPres)} Services ${joinCQ(performingServices.map((s) => s.schema.name))}`);
    log(`Stage: "${context.stage}"`);

    const startTime = hrtime();

    const env: PerformEnvironment = {
      tb, performingServices, actPast, actPres, context, actionServerlessCommand, actionTitle,
    };

    if (parallel) {
      await performParallel(env);
    } else {
      await performSequential(env);
    }

    const endTimeInSec = hrtime(startTime)[0].toString(10);

    log(chalk`{green Finished ${cap(actPres)} ({blue ${endTimeInSec} seconds}) }`);
  };
}
