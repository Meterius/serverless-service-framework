import { build, GluegunCommand, GluegunToolbox } from "gluegun";

export async function run(argv: any): Promise<GluegunToolbox> {
  const help: GluegunCommand = {
    name: "help",
    alias: "h",
    description: "Displays Help Page",
    run: async (tb: GluegunToolbox): Promise<void> => {
      tb.print.printHelp(tb);
    },
  };

  const defaultCommand: GluegunCommand = {
    ...help,
    hidden: true,
  };

  const cli = build("ssf")
    .src(__dirname)
    .help(help)
    .defaultCommand(defaultCommand)
    .create();

  return cli.run(argv);
}

run(process.argv).then(() => {}, (err) => { throw err; });
