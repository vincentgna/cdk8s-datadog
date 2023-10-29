# Datadog Operator CRDs

A sample CDK8s construct library for [datadog/datadog-operator](https://github.com/datadog/datadog-operator) CRDs.

## Compatibility table

| Construct Version | Datadog Operator Version |
| ----------------- | ------------------------ |
| 0.0.1+            | 1.2.1                    |

## Updating CRDs version

cdk8s import supports generating TypeScript interfaces from CRDs, but to customize the generated interfaces we require the JSII assembly declaration file (`.jsii`).

To generate the TS interfaces, including the JSII assembly declaration file, use the `import-crds` projen task as follows:

```shell
pj import-crds datadog/datadog-operator "1.2.1"
```
