import { join } from 'node:path';
import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import { AuthorizationType, LambdaIntegration, RestApi } from 'aws-cdk-lib/aws-apigateway';
import type { ITableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { CloudWatchLogGroup } from 'aws-cdk-lib/aws-events-targets';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';
import { LambdaFunction } from 'shared/cdk';
import { Person as PersonEvents } from 'shared/events';
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
      applicationLogLevelV2: props.config.logLevel,
      removalPolicy: props.config.removalPolicy,
      environment,
    });
    props.table.grant(createPersonLambda, 'dynamodb:PutItem');

    const platformEventBus = EventBus.fromEventBusName(this, 'PlatformEventBus', props.config.platformEventBusName);
    platformEventBus.grantPutEventsTo(createPersonLambda);

    // Routes person-created-event to a log group until a consumer subscribes to it
    const personCreatedLog = new LogGroup(this, 'PersonCreatedEventLog', {
      logGroupName: `/aws/events/person-created-${props.config.stage}`,
      retention: props.config.logRetention,
      removalPolicy: props.config.removalPolicy,
    });
    new Rule(this, 'PersonCreatedRule', {
      eventBus: platformEventBus,
      eventPattern: { source: [props.config.name], detailType: [PersonEvents.PERSON_CREATED_EVENT] },
      targets: [new CloudWatchLogGroup(personCreatedLog)],
    });

    const api = new RestApi(this, 'PersonApi', {
      restApiName: `person-api-${props.config.stage}`,
      deployOptions: { stageName: props.config.stage },
      defaultMethodOptions: { authorizationType: AuthorizationType.IAM },
    });
    api.root.addResource('person').addMethod('POST', new LambdaIntegration(createPersonLambda));

    new CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
