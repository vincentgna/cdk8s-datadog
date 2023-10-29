import * as path from "path";
import { cdk8s, TextFile } from "projen";
import { DatadogMonitorPropsBuilder } from "./projenrc/components";
const project = new cdk8s.ConstructLibraryCdk8s({
  author: "Vincent De Smet",
  authorAddress: "vincent@goodnotesapp.com",
  cdk8sVersion: "2.67.2",
  defaultReleaseBranch: "main",
  jsiiVersion: "~5.0.0",
  name: "@vincentgna/cdk8s-datadog",
  projenrcTs: true,
  repositoryUrl: "https://github.com/vincent/cdk8s-datadog.git",
  prettier: true,
  eslint: true,
  releaseToNpm: true,
  npmRegistryUrl: "https://npm.pkg.github.com",
  devDeps: [
    // projenrc/tasks/import-crds.ts
    "cdk8s-cli",
    "jsii-srcmak",
    "fs-extra",
    "@types/fs-extra",
    // projenrc/components
    // to build strongly typed DatadogMonitorProps
    "@mrgrain/jsii-struct-builder",
    "@jsii/spec",
  ],
});

// ensure node version is 18
new TextFile(project, ".nvmrc", {
  lines: ["v18"],
});

// add utility task to import CRDs from GitHub repo
project.addTask("import-crds", {
  exec: "ts-node projenrc/tasks/import-crds.ts",
  description:
    "Import CRDs from GitHub repo using doc.crds.dev and keep .jsii declaration for imported code.",
  receiveArgs: true,
});
const datadogAssemblyDeclaration = path.join(
  project.srcdir,
  "datadog-operator",
  ".jsii",
);
// commit .jsii assembly for imported datadog-operator CRDs
project.gitignore.include(datadogAssemblyDeclaration);
// ignore .jsii assembly from diffs
project.gitattributes.addAttributes(
  datadogAssemblyDeclaration,
  "linguist-generated",
);
// build strongly typed DatadogMonitorProps interface from .jsii assembly
new DatadogMonitorPropsBuilder(project);

// Prettier ignore imported and projen generated code
if (project.prettier?.ignoreFile) {
  project.prettier.ignoreFile.addPatterns(
    path.join(project.srcdir, "datadog-operator", "*.ts"),
    path.join(project.srcdir, "util", "*.ts"),
  );
}

project.synth();
