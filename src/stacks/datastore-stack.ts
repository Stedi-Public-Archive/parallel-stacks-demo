import { AttributeType, BillingMode, Table, TableEncryption } from '@aws-cdk/aws-dynamodb';
import { StringParameter } from '@aws-cdk/aws-ssm';
import { App, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core';

export interface DatastoreStackProps extends StackProps {
  stage: string;
}

export class DatastoreStack extends Stack {
  readonly table: Table;

  constructor(scope: App, id: string, props: DatastoreStackProps) {
    super(scope, id, props);

    this.table = new Table(this, 'Table', {
      encryption: TableEncryption.AWS_MANAGED,
      pointInTimeRecovery: true,
      partitionKey: {
        name: 'pk',
        type: AttributeType.STRING,
      },
      sortKey: {
        name: 'sk',
        type: AttributeType.STRING,
      },
      billingMode: BillingMode.PAY_PER_REQUEST,
      removalPolicy: props.stage === 'prod' ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    });

    new StringParameter(this, 'TableParameter', {
      parameterName: `table-${props.stage}`,
      stringValue: this.table.tableName,
    });
  }
}
