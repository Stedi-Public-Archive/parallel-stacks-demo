import { Table } from '@aws-cdk/aws-dynamodb';
import { IFunction, Runtime } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Secret } from '@aws-cdk/aws-secretsmanager';
import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';

export interface ApiStackProps extends StackProps {
  stage: string;
  externalApiKeySecret: Secret;
  table: Table;
}

export class ApiStack extends Stack {
  functions: IFunction[];

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);
    this.functions = [];

    const defaultEnvironmentVariables = {
      STAGE: props.stage,
      BILLING_TABLE_NAME: props.table.tableName,
      API_KEY_SECRET_ARN: props.externalApiKeySecret.secretArn,
    };

    const apiFunction = new NodejsFunction(this, 'DailyTask', {
      runtime: Runtime.NODEJS_14_X,
      entry: './src/functions/api.ts',
      handler: 'handler',
      timeout: Duration.seconds(30),
      environment: defaultEnvironmentVariables,
      logRetention: props.stage === 'prod' ? 30 : 3,
    });

    props.table.grantReadWriteData(apiFunction);
    props.externalApiKeySecret.grantRead(apiFunction);
    this.functions.push(apiFunction);
  }
}
