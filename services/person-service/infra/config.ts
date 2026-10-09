import type { App } from 'aws-cdk-lib';

export const stages = ['dev', 'prod'] as const;
export type Stage = (typeof stages)[number];

export interface PersonServiceConfig {
  stage: Stage;
}

export function getStage(app: App): Stage {
  const stage = app.node.tryGetContext('stage') ?? 'dev';
  if (!stages.includes(stage)) {
    throw new Error(`Unknown stage "${stage}". Expected one of: ${stages.join(', ')}`);
  }
  return stage;
}

export function getPersonServiceConfig(stage: Stage): PersonServiceConfig {
  return { stage };
}
