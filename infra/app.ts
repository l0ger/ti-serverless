import { App, Tags } from 'aws-cdk-lib';
import { getPlatformConfig, getStage, githubRepository } from './config';
import { GithubOidcProviderStack } from './stacks/github-oidc-provider-stack';
import { GithubOidcStack } from './stacks/github-oidc-stack';
import { PlatformStack } from './stacks/platform-stack';

const app = new App();
const config = getPlatformConfig(getStage(app));

const stack = new PlatformStack(app, `${config.name}-${config.stage}`, {
  config,
  env: config.env,
});

const oidcProviderStack = new GithubOidcProviderStack(app, `${config.name}-github-oidc-provider`, {
  env: config.env,
});

// Stage-level deploy role.
const oidcStack = new GithubOidcStack(app, `${config.name}-github-oidc-${config.stage}`, {
  env: config.env,
  roleName: `${config.name}-github-deploy-${config.stage}`,
  repository: githubRepository,
  githubEnvironment: config.githubEnvironment,
});

for (const s of [stack, oidcStack]) {
  Tags.of(s).add('Stage', config.stage);
}
for (const s of [stack, oidcProviderStack, oidcStack]) {
  Tags.of(s).add('Owner', config.name);
}
