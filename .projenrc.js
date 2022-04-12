const { awscdk, javascript } = require('projen');
const { GraphDeployWorkflow } = require('./.projen/workflows/graphDeploy');

const project = new awscdk.AwsCdkTypeScriptApp({
  name: 'parallel-stacks-demo',
  defaultReleaseBranch: 'main',
  packageManager: javascript.NodePackageManager.NPM,

  cdkVersion: '1.134.0',
  cdkVersionPinning: true,
  cdkDependencies: [
    '@aws-cdk/aws-cloudwatch',
    '@aws-cdk/aws-dynamodb',
    '@aws-cdk/aws-events',
    '@aws-cdk/aws-events-targets',
    '@aws-cdk/aws-iam',
    '@aws-cdk/aws-lambda',
    '@aws-cdk/aws-lambda-nodejs',
    '@aws-cdk/aws-secretsmanager',
    '@aws-cdk/aws-ssm',
  ],

  devDeps: ['esbuild'],

  depsUpgrade: false,
  stale: false,
});

project.addTask('generate:stack-graphs', {
  exec: 'node bin/generateStackGraphs.js',
});

new GraphDeployWorkflow(project, {
  name: 'Deploy',
});

project.synth();
