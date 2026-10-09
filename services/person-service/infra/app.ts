import { App, Tags } from 'aws-cdk-lib';
import { getPersonServiceConfig, getStage } from './config';
import { PersonServiceStack } from './person-service-stack';

const app = new App();
const config = getPersonServiceConfig(getStage(app));

const stack = new PersonServiceStack(app, `PersonService-${config.stage}`, {
  config,
  env: config.env,
});

Tags.of(stack).add('Stage', config.stage);
Tags.of(stack).add('Service', 'person-service');
