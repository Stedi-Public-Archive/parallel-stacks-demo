import { App } from '@aws-cdk/core';

import {
  ApiStack,
  AsyncStack,
  DashboardStack,
  DatastoreStack,
  SecretsStack,
} from './stacks';

const app = new App();

const stage = process.env.STAGE ?? 'demo';

const secretsStack = new SecretsStack(app, `Secrets-${stage}`, { stage });
const datastoreStack = new DatastoreStack(app, `Datastore-${stage}`, { stage });

const asyncStack = new AsyncStack(app, `Async-${stage}`, {
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
  lambdaFunctions: [
    ...asyncStack.functions,
    ...apiStack.functions,
  ],
});

app.synth();
