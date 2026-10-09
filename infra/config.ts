import type { App, Environment } from 'aws-cdk-lib';

export const stages = ['test', 'prod'] as const;
export type Stage = (typeof stages)[number];

/**
 * GitHub repository in the immutable OIDC `sub` form `owner@<owner id>/repo@<repo id>`.
 * Repos created after 15 July 2026 emit this form; IDs from https://api.github.com/repos/l0ger/ti-serverless
 */
export const githubRepository = 'l0ger@16212989/ti-serverless@1411527725';

export interface PlatformConfig {
  stage: Stage;
  env: Required<Environment>;
  githubEnvironment: string;
}

const configs: Record<Stage, Omit<PlatformConfig, 'env'>> = {
  test: {
    stage: 'test',
    githubEnvironment: 'test',
  },
  prod: {
    stage: 'prod',
    githubEnvironment: 'prod',
  },
};

/** Reads the stage from `cdk ... -c stage=<stage>`. */
export function getStage(app: App): Stage {
  const stage = app.node.tryGetContext('stage');
  if (!stages.includes(stage)) {
    throw new Error(`Unknown stage "${stage}". Pass -c stage=<${stages.join('|')}>`);
  }
  return stage;
}

/** Loads `env/<stage>.env` (shared with the GitHub workflow) and builds the stage config. */
export function getPlatformConfig(stage: Stage): PlatformConfig {
  process.loadEnvFile(new URL(`./env/${stage}.env`, import.meta.url));
  return {
    ...configs[stage],
    env: { account: requireEnv('AWS_ACCOUNT_ID'), region: requireEnv('AWS_REGION') },
  };
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Set it in the stage's env file.`);
  }
  return value;
}
