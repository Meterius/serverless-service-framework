import { build, GluegunCommand, GluegunToolbox } from "gluegun";
import chalk from "chalk";
import { CliError } from "./utility/exceptions";

export async function run(argv: any): Promise<GluegunToolbox> {
  const help: GluegunCommand = {
    name: "help",
    alias: "h",
    description: "Displays Help Page",
    run: async (tb: GluegunToolbox): Promise<void> => {
      tb.print.printHelp(tb);
    },
  };

  const cli = build("ssf")
    .src(__dirname)
    .help(help)
    .create();

  return cli.run(argv);
}

run(process.argv).then(
  () => {},
  (err) => {
    if (err instanceof CliError) {
      // eslint-disable-next-line no-console
      console.error(chalk`{red ${err.message}}`);
    } else {
      // eslint-disable-next-line no-console
      console.error(err);
    }

    process.exit(1);
  },
);
