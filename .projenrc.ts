import { cdk8s } from "projen";
const project = new cdk8s.ConstructLibraryCdk8s({
  author: "Vincent De Smet",
  authorAddress: "vincent@goodnotesapp.com",
  cdk8sVersion: "2.67.2",
  defaultReleaseBranch: "main",
  jsiiVersion: "~5.0.0",
  name: "cdk8s-datadog",
  projenrcTs: true,
  repositoryUrl: "https://github.com/vincent/cdk8s-datadog.git",
  prettier: true,
  eslint: true,
  releaseToNpm: true,
  npmRegistryUrl: "https://npm.pkg.github.com",
  sampleCode: false,
});
if (project.prettier?.ignoreFile) {
  project.prettier.ignoreFile.addPatterns("src/datadoghq.com.ts");
}
project.gitignore.exclude("versions/**");
project.addTask("update-src", {
  exec: "bash ./projenrc/tasks/update-src.sh",
  description: "Convert CRDs to CDK8s generated Typescript interfaces",
  receiveArgs: true,
});
project.synth();
