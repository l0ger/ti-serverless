import { App, Tags } from 'aws-cdk-lib';
import { getPlatformConfig, getStage } from './config';
import { PlatformStack } from './stacks/platform-stack';

const app = new App();
const stage = getStage(app);
const config = getPlatformConfig(stage);

const stack = new PlatformStack(app, `Platform-${stage}`, {
  config,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

Tags.of(stack).add('Stage', stage);
Tags.of(stack).add('Owner', 'platform');
