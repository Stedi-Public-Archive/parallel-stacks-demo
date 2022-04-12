import { Table } from "@aws-cdk/aws-dynamodb";
import { Rule, Schedule } from "@aws-cdk/aws-events";
import { LambdaFunction } from "@aws-cdk/aws-events-targets";
import { IFunction, Runtime } from "@aws-cdk/aws-lambda";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";
import { Secret } from "@aws-cdk/aws-secretsmanager";
import { Construct, Duration, Stack, StackProps } from "@aws-cdk/core";

export interface AsyncJobsStackProps extends StackProps {
  stage: string;
  externalApiKeySecret: Secret;
  table: Table;
}

export class AsyncJobsStack extends Stack {
  functions: IFunction[];

  constructor(scope: Construct, id: string, props: AsyncJobsStackProps) {
    super(scope, id, props);
    this.functions = [];

    const defaultEnvironmentVariables = {
      STAGE: props.stage,
      BILLING_TABLE_NAME: props.table.tableName,
      API_KEY_SECRET_ARN: props.externalApiKeySecret.secretArn,
    };

    const dailyTask = new NodejsFunction(this, "DailyTask", {
      runtime: Runtime.NODEJS_14_X,
      entry: "./src/functions/daily-task.ts",
      handler: "handler",
      timeout: Duration.minutes(10),
      environment: defaultEnvironmentVariables,
      logRetention: props.stage === "prod" ? 30 : 3,
    });

    props.table.grantReadWriteData(dailyTask);
    props.externalApiKeySecret.grantRead(dailyTask);
    this.functions.push(dailyTask);

    const eventRule = new Rule(this, "Schedule1AMUtcDaily", {
      schedule: Schedule.cron({ minute: "0", hour: "1" }),
    });
    eventRule.addTarget(new LambdaFunction(dailyTask));
  }
}
