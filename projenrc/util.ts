import { spawn, SpawnOptions } from "child_process";
import * as path from "path";
import { TypeKind, loadAssemblyFromPath } from "@jsii/spec";
import { TypeScriptProject } from "projen/lib/typescript";

/**
 * Find interface from JSII Assembly ${moduleName} at project.srcdir/${moduleName}
 *
 * @param project containing the src directory with a ${moduleName} directory
 * @param moduleName assembly name
 * @param name interface name
 * @returns the interface type from the assembly declaration
 */
export function findInterface(
  project: TypeScriptProject,
  moduleName: string,
  name: string,
) {
  const asm = loadAssemblyFromPath(path.join(project.srcdir, moduleName));
  const candidate = asm.types?.[`${moduleName}.${name}`];
  if (!candidate || candidate.kind != TypeKind.Interface) {
    throw new Error(`Unable to find ${name} or not an Interface`);
  }
  return candidate;
}

export async function exec(
  moduleName: string,
  args: string[] = [],
  options: SpawnOptions = {},
) {
  return new Promise<void>((ok, fail) => {
    const opts: SpawnOptions = {
      ...options,
      stdio: ["inherit", "pipe", "pipe"],
      shell: true,
    };

    const child = spawn(`"${process.execPath}"`, [moduleName, ...args], opts);

    const data = new Array<Buffer>();
    child.stdout?.on("data", (chunk) => data.push(chunk));
    child.stderr?.on("data", (chunk) => data.push(chunk));

    const newError = (message: string) =>
      new Error(
        [
          message,
          "  | " +
            Buffer.concat(data)
              .toString("utf-8")
              .split("\n")
              .filter((x) => x)
              .join("\n  | "),
          "  +----------------------------------------------------------------------------------",
          `  | Command: ${moduleName} ${args.join(" ")}`,
          `  | Workdir: ${path.resolve(options.cwd?.toString() ?? ".")}`,
          "  +----------------------------------------------------------------------------------",
        ].join("\n"),
      );

    child.once("error", (err) => {
      throw newError(`jsii compilation failed. error: ${err.message}`);
    });

    child.once("exit", (code) => {
      if (code === 0) {
        return ok();
      } else {
        return fail(
          newError(`jsii compilation failed with non-zero exit code: ${code}`),
        );
      }
    });
  });
}
