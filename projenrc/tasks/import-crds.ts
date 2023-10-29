/**
 * Call cdk8s import for a GitHub repo using doc.crds.dev and
 * Re-generate the .jsii declaration for the imported code.
 *
 * Note: Clears the ./src/<repo-name> directory before running cdk8s import
 */

import * as path from "path";
import * as fs from "fs-extra";
import * as srcmak from "jsii-srcmak";

import { exec } from "../util";

// Resolving "cdk8s-cli" or "cdk8s-cli/bin/cdk8s") does not work,
// only "package.json" is in npm exports, resolve and slice
const cdk8sCliExport = "package.json";
const cdk8s = require
  .resolve(`cdk8s-cli/${cdk8sCliExport}`)
  .slice(0, -cdk8sCliExport.length);
const cdk8sBin = path.join(cdk8s, "bin", "cdk8s");

export async function importWithJsiiDeclaration(repo: string, version: string) {
  const moduleName = repo.split("/").at(1) ?? "imports";
  const workDir = "./src";
  fs.removeSync(path.join(workDir, moduleName));
  // run cdk8s-cli import to generate code into workDir
  await exec(
    cdk8sBin,
    [
      "import",
      `-o ${moduleName}`,
      `github:${repo}@${version}`,
      "-l typescript",
    ],
    { cwd: workDir },
  );
  // generate index.ts for srcmak default entrypoint
  const indexLines = [
    "// generated by import-crds.ts",
    `// version ${version}`,
  ];
  fs.readdirSync(path.join(workDir, moduleName)).forEach((file) => {
    if (file.endsWith(".ts")) {
      indexLines.push(`export * from "./${file.slice(0, -3)}";`);
    }
  });
  fs.writeFileSync(
    path.join(workDir, moduleName, "index.ts"),
    indexLines.join("\n"),
  );
  // re-generate jsii from imported code
  const deps = ["@types/node", "constructs", "cdk8s"];
  const opts: srcmak.Options = {
    moduleKey: moduleName,
    deps: deps.map((dep) =>
      path.dirname(require.resolve(path.join(dep, "package.json"))),
    ),
    jsii: {
      path: path.join(workDir, moduleName, ".jsii"),
    },
  };
  await srcmak.srcmak(path.join(workDir, moduleName), opts);
}

const args = process.argv.slice(2); // Ignore node and filename path
// ensure args are passed in
if (args.length < 2) {
  console.error("Usage: ts-node import-crds.ts <version>");
  console.error(
    [
      "  repo: github repo in the format <org>/<repo>",
      "  version: git tag without the v prefix (i.e. 1.2.1)",
    ].join("\n"),
  );
  process.exit(1);
}
const [repo, version] = args;
void importWithJsiiDeclaration(repo, version).then(() => {
  console.log(`Imported CRDs v${version}`);
});
