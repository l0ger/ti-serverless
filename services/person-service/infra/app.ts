import { App, Tags } from 'aws-cdk-lib';
import { getPersonServiceConfig, getStage } from './config';
import { PersonServiceStack } from './person-service-stack';

const app = new App();
const stage = getStage(app);
const config = getPersonServiceConfig(stage);

const stack = new PersonServiceStack(app, `PersonService-${stage}`, {
  config,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

Tags.of(stack).add('Stage', stage);
Tags.of(stack).add('Service', 'person-service');
