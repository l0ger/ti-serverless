import { App, Tags } from 'aws-cdk-lib';
import { GithubOidcStack } from '../shared/github-oidc-stack';
import { getPlatformConfig, getStage, githubRepository } from './config';
import { PlatformStack } from './stacks/platform-stack';

const app = new App();
const config = getPlatformConfig(getStage(app));

const stack = new PlatformStack(app, `Platform-${config.stage}`, {
  config,
  env: config.env,
});

// Deployed manually once per account; the pipeline only deploys Platform-<stage>.
const oidcStack = new GithubOidcStack(app, `GithubOidc-Platform-${config.stage}`, {
  env: config.env,
  repository: githubRepository,
  githubEnvironment: config.githubEnvironment,
});

for (const s of [stack, oidcStack]) {
  Tags.of(s).add('Stage', config.stage);
  Tags.of(s).add('Owner', 'platform');
}
