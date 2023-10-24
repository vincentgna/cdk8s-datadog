# DataDog Operator CRDs

## Compatibility table

| Construct Version | DataDog Operator Version |
| ----------------- | ------------------------ |
| 0.0.1             | 1.2.1                    |

## Generate TS interfaces

Refer to [cdk8s-gloo](https://github.com/GoodNotes/cdk8s-gloo/blob/main/.scripts/import-gloo-crds.sh)

```shell
# add the DataDog Helm repo
helm repo add datadog https://helm.datadoghq.com
# or, if already exist, make sure to update helm repo index
helm repo update datadog

# confirm latest version
helm show chart datadog/datadog-operator | yq .version

# to generate CRDs for version 1.2.1
VERSION="1.2.1"
# CRDs are templated, so we need to render them from the Helm Chart
helm template datadog/datadog-operator --version "${VERSION}" \
  --output-dir versions/${VERSION} \
  --api-versions "1.23" \
  --set crds.datadogMetrics=true \
  --set crds.datadogAgents=true \
  --set crds.datadogMonitors=true

# CDK8s requires a single file, so we need to combine the CRDs
find "versions/${VERSION}/datadog-operator/charts/datadogCRDs/templates" -type f -exec cat {} \; -exec echo "---" \; >"versions/${VERSION}/combined-crds.yaml"
rm -rf versions/${VERSION}/datadog-operator

# Use the `update-src` Projen task to re-write the Typescript src files
# (using CDK8s import)
pj update-src 1.2.1 "${VERSION}"
```
