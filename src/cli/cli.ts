import { build, GluegunCommand, GluegunToolbox } from "gluegun";
import chalk from "chalk";

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
    console.log(chalk`{red ${err.message}}`);
    process.exit(1);
  },
);
