import path from "path";
import { mkdirp, readFile, writeFile } from "fs-extra";
import { AbstractBase } from "./abstract-base";
import { APD, BaseParameter } from "./abstract-provider-definition";

export abstract class AbstractBaseWithFsLocation<
  D extends APD, // AbstractProviderDefinition
> extends AbstractBase<D> {
  readonly dirPath: string;

  private readonly fsEntityName: string;

  protected constructor(base: BaseParameter<D>, dirPath: string, fsEntityName: string) {
    super(base);
    this.dirPath = dirPath;
    this.fsEntityName = fsEntityName;
  }

  /*
   * Directory Management
   */

  // returns absolute file path of file path relative to the entity directory
  resolvePath(relPath: string): string {
    return path.join(this.dirPath, relPath);
  }

  /**
   * Returns data of file at file path relative to the entity directory.
   * Returns undefined if the file does not exist.
   */
  async retrieveFile(relPath: string): Promise<string | undefined> {
    try {
      return (await readFile(this.resolvePath(relPath))).toString();
    } catch (err) {
      if (err.code === "ENOENT") {
        return undefined;
      } else {
        throw err;
      }
    }
  }

  /**
   * Returns data of file at file path relative to the entity directory.
   * Throws if file does not exist.
   */
  async getFile(relPath: string): Promise<string> {
    const data = await this.retrieveFile(relPath);

    if (data === undefined) {
      throw new Error(`${this.fsEntityName} File "${relPath}" not found`);
    } else {
      return data;
    }
  }

  /**
   * Writes file at file path relative to the entity directory.
   * Note: It will create necessary sub directories if the file
   * is contained in one that does not exist yet
   */
  async writeServiceFile(relPath: string, data: string | Buffer): Promise<void> {
    const filePath = this.resolvePath(relPath);
    await mkdirp(path.dirname(filePath));

    await writeFile(relPath, data);
  }
}
