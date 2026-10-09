import type { App, Environment } from 'aws-cdk-lib';

export const stages = ['test', 'prod'] as const;
export type Stage = (typeof stages)[number];

export interface PersonServiceConfig {
  stage: Stage;
  env: Required<Environment>;
}

const configs: Record<Stage, PersonServiceConfig> = {
  test: {
    stage: 'test',
    env: { account: '333333333333', region: 'eu-central-1' }, // TODO: person-service test account ID
  },
  prod: {
    stage: 'prod',
    env: { account: '444444444444', region: 'eu-central-1' }, // TODO: person-service prod account ID
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

export function getPersonServiceConfig(stage: Stage): PersonServiceConfig {
  return configs[stage];
}
