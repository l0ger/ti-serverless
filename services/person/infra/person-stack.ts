import { join } from 'node:path';
import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import { AuthorizationType, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import type { ITableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { EventBus } from 'aws-cdk-lib/aws-events';
import type { Construct } from 'constructs';
import { LambdaFunction } from 'shared/cdk';
import type { PersonEnvironment } from '../env/environment';
import type { PersonConfig } from './config';

export interface PersonStackProps extends StackProps {
  config: PersonConfig;
  table: ITableV2;
}

export class PersonStack extends Stack {
  constructor(scope: Construct, id: string, props: PersonStackProps) {
    super(scope, id, props);

    const environment: PersonEnvironment = {
      TABLE_NAME: props.table.tableName,
      PLATFORM_EVENT_BUS_NAME: props.config.platformEventBusName,
      SERVICE_NAME: props.config.name,
    };

    const createPersonLambda = new LambdaFunction(this, 'CreatePersonLambda', {
      entry: join(import.meta.dirname, '../apis/create-person/index.ts'),
      logRetention: props.config.logRetention,
      removalPolicy: props.config.removalPolicy,
      environment,
    });
    props.table.grantWriteData(createPersonLambda);

    const platformEventBus = EventBus.fromEventBusName(this, 'PlatformEventBus', props.config.platformEventBusName);
    platformEventBus.grantPutEventsTo(createPersonLambda);

    const api = new RestApi(this, 'PersonApi', {
      restApiName: `person-api-${props.config.stage}`,
      deployOptions: { stageName: props.config.stage },
      defaultMethodOptions: { authorizationType: AuthorizationType.IAM },
    });
    api.root.addResource('person').addMethod('POST', new LambdaIntegration(createPersonLambda));

    new CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
