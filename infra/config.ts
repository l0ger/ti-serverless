import type { App, Environment } from 'aws-cdk-lib';

export const stages = ['test', 'prod'] as const;
export type Stage = (typeof stages)[number];

export const githubRepository = 'l0ger/ti-serverless';

export interface PlatformConfig {
  stage: Stage;
  env: Required<Environment>;
  githubEnvironment: string;
}

const configs: Record<Stage, PlatformConfig> = {
  test: {
    stage: 'test',
    env: { account: '111111111111', region: 'eu-central-1' }, // TODO: platform test account ID
    githubEnvironment: 'platform-test',
  },
  prod: {
    stage: 'prod',
    env: { account: '222222222222', region: 'eu-central-1' }, // TODO: platform prod account ID
    githubEnvironment: 'platform-prod',
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

export function getPlatformConfig(stage: Stage): PlatformConfig {
  return configs[stage];
}
