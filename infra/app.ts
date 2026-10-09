import { App, Tags } from 'aws-cdk-lib';
import { getPlatformConfig, getStage, githubRepository } from './config';
import { GithubOidcStack } from './stacks/github-oidc-stack';
import { PlatformStack } from './stacks/platform-stack';

const app = new App();
const config = getPlatformConfig(getStage(app));

const stack = new PlatformStack(app, `Platform-${config.stage}`, {
  config,
  env: config.env,
});

// Account-level, shared by all units in the stage account. Deployed manually once per account;
// the pipeline only deploys Platform-<stage> and the service stacks.
const oidcStack = new GithubOidcStack(app, `GithubOidc-${config.stage}`, {
  env: config.env,
  repository: githubRepository,
  githubEnvironment: config.githubEnvironment,
});

for (const s of [stack, oidcStack]) {
  Tags.of(s).add('Stage', config.stage);
  Tags.of(s).add('Owner', 'platform');
}
