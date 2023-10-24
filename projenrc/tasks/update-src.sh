#!/bin/sh
set -e
VERSION=$1
if [ -z "${VERSION}" ]; then
  echo "Usage: $0 <version>"
  exit 1
fi

rm -rf src/
npx cdk8s-cli@latest import --language typescript -o src/ "versions/${VERSION}/combined-crds.yaml"
for f in "src/"*.ts; do
  import=$(basename "${f}" .ts)
  echo "export * from \"./${import}\";" >>"src/index.ts"
done
# add version header
ed -s "src/index.ts" <<EOF
1i
// Version: ${VERSION}

.
w
EOF
