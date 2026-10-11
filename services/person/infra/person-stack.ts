import { join } from 'node:path';
import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import type { ITableV2 } from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';
import { LambdaFunction } from 'shared/cdk';
import type { PersonConfig } from './config';

export interface PersonStackProps extends StackProps {
  config: PersonConfig;
  table: ITableV2;
}

export class PersonStack extends Stack {
  constructor(scope: Construct, id: string, props: PersonStackProps) {
    super(scope, id, props);

    const createPersonLambda = new LambdaFunction(this, 'CreatePersonLambda', {
      entry: join(import.meta.dirname, '../apis/create-person/index.ts'),
      logRetention: props.config.logRetention,
      removalPolicy: props.config.removalPolicy,
      environment: {
        TABLE_NAME: props.table.tableName,
      },
    });
    props.table.grantWriteData(createPersonLambda);

    const api = new RestApi(this, 'PersonApi', {
      restApiName: `person-api-${props.config.stage}`,
      deployOptions: { stageName: props.config.stage },
    });
    api.root.addResource('person').addMethod('POST', new LambdaIntegration(createPersonLambda));

    new CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
