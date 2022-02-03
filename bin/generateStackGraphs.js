const execSync = require("child_process").execSync;
const fs = require('fs');
const path = require('path');
const { parseManifest } = require('./stackDeps');

const stages = ['demo'];
const stackGraphs = {};

stages.map((stage) => {
  execSync(`STAGE=${stage} npx cdk synth`, {
    stdio: ['ignore', 'ignore', 'ignore'],
  });
  stackGraphs[stage] = parseManifest();
});

const data = JSON.stringify(stackGraphs, undefined, 2);
fs.writeFileSync(path.join(__dirname, '..', 'generated', 'graph.json'), data);