import { App, Tags } from 'aws-cdk-lib';
import { GithubOidcStack } from '../../../shared/github-oidc-stack';
import { getPersonConfig, getStage, githubRepository } from './config';
import { PersonStack } from './person-stack';

const app = new App();
const config = getPersonConfig(getStage(app));

const stack = new PersonStack(app, `Person-${config.stage}`, {
  config,
  env: config.env,
});

// Deployed manually once per account, for first time only.;
// The pipeline only deploys Person-<stage>.
const oidcStack = new GithubOidcStack(app, `GithubOidc-Person-${config.stage}`, {
  env: config.env,
  repository: githubRepository,
  githubEnvironment: config.githubEnvironment,
});

for (const s of [stack, oidcStack]) {
  Tags.of(s).add('Stage', config.stage);
  Tags.of(s).add('Service', 'person');
}
