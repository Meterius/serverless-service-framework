import { build } from "gluegun";
import chalk from "chalk";
import { CliError } from "./utility/exceptions";
import { TB, GC } from "./cli-types";

const help: GC = {
  name: "help",
  alias: "h",
  description: "Displays Help Page",
  run: (tb: TB): void => {
    tb.print.printHelp(tb);
  },
};

const cli = build("ssf")
  .src(__dirname)
  .help(help)
  .create();

cli.run(process.argv).then(
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
