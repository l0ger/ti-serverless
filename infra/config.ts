import type { Environment } from 'aws-cdk-lib';
import { requireEnv, type Stage } from 'shared/env-helpers';

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

export function getPlatformConfig(stage: Stage): PlatformConfig {
  process.loadEnvFile(new URL(`./env/${stage}.env`, import.meta.url));
  return {
    ...configs[stage],
    env: { account: requireEnv('AWS_ACCOUNT_ID'), region: requireEnv('AWS_REGION') },
  };
}
