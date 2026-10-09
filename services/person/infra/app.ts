import { App, Tags } from 'aws-cdk-lib';
import { getPersonConfig, getStage } from './config';
import { PersonStack } from './person-stack';

const app = new App();
const config = getPersonConfig(getStage(app));

const stack = new PersonStack(app, `Person-${config.stage}`, {
  config,
  env: config.env,
});

Tags.of(stack).add('Stage', config.stage);
Tags.of(stack).add('Service', 'person');
