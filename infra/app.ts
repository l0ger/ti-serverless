import { App, Tags } from 'aws-cdk-lib';
import { getPlatformConfig, getStage } from './config';
import { PlatformStack } from './stacks/platform-stack';

const app = new App();
const config = getPlatformConfig(getStage(app));

const stack = new PlatformStack(app, `Platform-${config.stage}`, {
  config,
  env: config.env,
});

Tags.of(stack).add('Stage', config.stage);
Tags.of(stack).add('Owner', 'platform');
