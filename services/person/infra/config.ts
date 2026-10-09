import type { App, Environment } from 'aws-cdk-lib';

export const stages = ['test', 'prod'] as const;
export type Stage = (typeof stages)[number];

export interface PersonConfig {
  stage: Stage;
  env: Required<Environment>;
}

const configs: Record<Stage, Omit<PersonConfig, 'env'>> = {
  test: {
    stage: 'test',
  },
  prod: {
    stage: 'prod',
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
export function getPersonConfig(stage: Stage): PersonConfig {
  process.loadEnvFile(new URL(`../env/${stage}.env`, import.meta.url));
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
