import { Secret } from '@aws-cdk/aws-secretsmanager';
import { Construct, Stack, StackProps } from '@aws-cdk/core';

export interface SecretsStackProps extends StackProps {
  stage: string;
}

export class SecretsStack extends Stack {
  readonly externalApiKeySecret: Secret;

  constructor(scope: Construct, id: string, props: SecretsStackProps) {
    super(scope, id, props);

    this.externalApiKeySecret = new Secret(this, 'ApiKey', {
      description: `External ApiKey for ${props.stage}`,
    });
  }
}
