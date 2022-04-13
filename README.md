# Parallel CDK Stacks Demo

[Blog post](https://www.stedi.com/blog/parallel-cdk-stack-deployments)

## Key files / functions

* [stackDeps.js](bin/stackDeps.js) - parses the `cdk.out/manifest.json` and returns our stacks
* [generateStackGraphs.js](bin/generateStackGraphs.js) - uses `stackDeps.js` and `cdk synth` to generate the `graph.json`
* [graph.json](generated/graph.json) - the generated graph from our `npx projen generate:stack-graphs` task
* [graphDeploy.js](.projen/workflows/graphDeploy.js) - custom projen deploy workflow that generates the `deploy.yml` for the project. We take the graph from `generated/graph.json` and create a workflow based on the dependencies.

## Run it yourself

```
# Generate the stack graphs first
npx projen generate:stack-graphs # custom task in .projenrc.js

# Then run projen default to create the workflow
npx projen
```
