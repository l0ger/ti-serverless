import { App, Tags } from 'aws-cdk-lib';
import { getPlatformConfig, getStage, githubRepository } from './config';
import { GithubOidcProviderStack } from './stacks/github-oidc-provider-stack';
import { GithubOidcStack } from './stacks/github-oidc-stack';
import { PlatformStack } from './stacks/platform-stack';

const app = new App();
const config = getPlatformConfig(getStage(app));

const stack = new PlatformStack(app, `Platform-${config.stage}`, {
  config,
  env: config.env,
});

// Deployed manually by `platform:bootstrap`; the pipeline only deploys Platform-<stage> and the service stacks.
// Account-level, no stage in name or tags, so a second stage in the same account leaves it unchanged.
const oidcProviderStack = new GithubOidcProviderStack(app, 'GithubOidcProvider', {
  env: config.env,
});

// Stage-level deploy role.
const oidcStack = new GithubOidcStack(app, `GithubOidc-${config.stage}`, {
  env: config.env,
  repository: githubRepository,
  githubEnvironment: config.githubEnvironment,
});

for (const s of [stack, oidcStack]) {
  Tags.of(s).add('Stage', config.stage);
}
for (const s of [stack, oidcProviderStack, oidcStack]) {
  Tags.of(s).add('Owner', 'platform');
}
