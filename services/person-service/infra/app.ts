import { App, Tags } from 'aws-cdk-lib';
import { GithubOidcStack } from '../../../shared/github-oidc-stack';
import { getPersonServiceConfig, getStage, githubRepository } from './config';
import { PersonServiceStack } from './person-service-stack';

const app = new App();
const config = getPersonServiceConfig(getStage(app));

const stack = new PersonServiceStack(app, `PersonService-${config.stage}`, {
  config,
  env: config.env,
});

// Deployed manually once per account, for first time only.;
// The pipeline only deploys PersonService-<stage>.
const oidcStack = new GithubOidcStack(app, `GithubOidc-PersonService-${config.stage}`, {
  env: config.env,
  repository: githubRepository,
  githubEnvironment: config.githubEnvironment,
});

for (const s of [stack, oidcStack]) {
  Tags.of(s).add('Stage', config.stage);
  Tags.of(s).add('Service', 'person-service');
}
