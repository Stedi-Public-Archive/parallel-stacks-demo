import { App } from "@aws-cdk/core";

import {
  ApiStack,
  AsyncJobsStack,
  DashboardStack,
  DatastoreStack,
  SecretsStack,
} from "./stacks";

const app = new App();

const stage = process.env.STAGE ?? "demo";

const secretsStack = new SecretsStack(app, `Secrets-${stage}`, { stage });
const datastoreStack = new DatastoreStack(app, `Datastore-${stage}`, { stage });

const asyncJobsStack = new AsyncJobsStack(app, `AsyncJobs-${stage}`, {
  stage,
  table: datastoreStack.table,
  externalApiKeySecret: secretsStack.externalApiKeySecret,
});

const apiStack = new ApiStack(app, `Api-${stage}`, {
  stage,
  table: datastoreStack.table,
  externalApiKeySecret: secretsStack.externalApiKeySecret,
});

new DashboardStack(app, `Dashboards-${stage}`, {
  stage,
  lambdaFunctions: [...asyncJobsStack.functions, ...apiStack.functions],
});

app.synth();
