import { App, Tags } from 'aws-cdk-lib';
import { getPersonConfig, getStage } from './config';
import { PersonDataStack } from './person-data-stack';
import { PersonStack } from './person-stack';

const app = new App();
const config = getPersonConfig(getStage(app));

const dataStack = new PersonDataStack(app, `${config.name}-data-${config.stage}`, {
  config,
  env: config.env,
});

const stack = new PersonStack(app, `${config.name}-${config.stage}`, {
  config,
  env: config.env,
  table: dataStack.table,
});

for (const s of [dataStack, stack]) {
  Tags.of(s).add('Stage', config.stage);
  Tags.of(s).add('Service', config.name);
}
