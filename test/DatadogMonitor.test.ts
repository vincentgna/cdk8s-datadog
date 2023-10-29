import { Testing, Chart } from "cdk8s";
import { DatadogMonitor } from "../src";

test("DatadogMonitor props are strongly typed", () => {
  // GIVEN
  const app = Testing.app();
  const chart = new Chart(app, "test");
  new DatadogMonitor(chart, "Foo", {
    type: "metric alert",
    query: `avg(last_5m):sum:docker.cpu.usage{kube_deployment:chart-foo-deploy} > 80`,
    name: "[CDK8s] podinfo pod cpu utilisation is too high",
    message: `CPU Usage over 80 for the last 5min, review Autoscaling triggers`,
  });

  new DatadogMonitor(chart, "Bar", {
    kubeMetadata: {
      name: "bar",
    },
    type: "metric alert",
    query: `avg(last_5m):sum:docker.cpu.usage{kube_deployment:chart-foo-deploy} > 80`,
    name: "[CDK8s] podinfo pod cpu utilisation is too high",
    message: `CPU Usage over 80 for the last 5min, review Autoscaling triggers`,
  });
  // THEN
  expect(Testing.synth(chart)).toMatchSnapshot();
});
