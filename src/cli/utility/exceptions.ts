// cli errors will only have their message printed out
export class CliError extends Error {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(msg: string) {
    super(msg);
  }
}
