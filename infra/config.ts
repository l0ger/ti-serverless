import type { App, Environment } from 'aws-cdk-lib';

export const stages = ['test', 'prod'] as const;
export type Stage = (typeof stages)[number];



export const githubRepository = 'l0ger@16212989/ti-serverless@1411527725';

export interface PlatformConfig {
  name: string;
  stage: Stage;
  env: Required<Environment>;
  githubEnvironment: string;
}

const configs: Record<Stage, Omit<PlatformConfig, 'env'>> = {
  test: {
    name: 'platform',
    stage: 'test',
    githubEnvironment: 'test',
  },
  prod: {
    name: 'platform',
    stage: 'prod',
    githubEnvironment: 'prod',
  },
};

export function getStage(app: App): Stage {
  const stage = app.node.tryGetContext('stage');
  if (!stages.includes(stage)) {
    throw new Error(`Unknown stage "${stage}". Pass -c stage=<${stages.join('|')}>`);
  }
  return stage;
}

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
