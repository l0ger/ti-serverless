import type { App } from 'aws-cdk-lib';

export const stages = ['test', 'prod'] as const;
export type Stage = (typeof stages)[number];

export function getStage(app: App): Stage {
  const stage = app.node.tryGetContext('stage');
  if (!stages.includes(stage)) {
    throw new Error(`Unknown stage "${stage}". Pass -c stage=<${stages.join('|')}>`);
  }
  return stage;
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Set it in the stage's env file.`);
  }
  return value;
}
