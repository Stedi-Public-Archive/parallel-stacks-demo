/**
 * Grabbed this from Serverless Stack (SST)
 * https://github.com/serverless-stack/serverless-stack/blob/270bb36901a58b2898ccc6bcea7cba2a9520a654/packages/core/src/index.ts#L1623-L1658
 */
const fs = require("fs");
const path = require("path");

exports.parseManifest = () => {
  const defaultRegion = "us-east-1";
  const stacks = [];

  try {
    // Parse the manifest.json file inside cdk.out
    const manifestPath = path.join(process.cwd(), "./cdk.out/manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    
    // Loop through each CloudFormation stack
    Object.keys(manifest.artifacts)
      .filter((key) => manifest.artifacts[key].type === "aws:cloudformation:stack")
      .forEach((key) => {
        const { environment, properties, dependencies } = manifest.artifacts[key];
        // Parse for region
        // ie. aws://112233445566/us-west-1
        const region = environment.split("/").pop();
        stacks.push({
          id: key,
          name: properties.stackName || key,
          region: !region || region === "unknown-region" ? defaultRegion : region,
          dependencies: (dependencies || []).filter(
            (dep) => manifest.artifacts[dep].type === "aws:cloudformation:stack",
          ),
        });
      });
  } catch (e) {
    console.error("Failed to parse generated manifest.json", e);
  }

  return { stacks };
};
