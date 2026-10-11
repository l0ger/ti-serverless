import { RemovalPolicy, type App, type Environment } from 'aws-cdk-lib';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';

export const stages = ['test', 'prod'] as const;
export type Stage = (typeof stages)[number];

export interface PersonConfig {
  stage: Stage;
  env: Required<Environment>;
  removalPolicy: RemovalPolicy;
  pointInTimeRecovery: boolean;
  protectData: boolean;
  logRetention: RetentionDays;
}

const configs: Record<Stage, Omit<PersonConfig, 'env'>> = {
  test: {
    stage: 'test',
    removalPolicy: RemovalPolicy.DESTROY,
    pointInTimeRecovery: false,
    protectData: false,
    logRetention: RetentionDays.ONE_WEEK,
  },
  prod: {
    stage: 'prod',
    removalPolicy: RemovalPolicy.RETAIN,
    pointInTimeRecovery: true,
    protectData: true,
    logRetention: RetentionDays.THREE_MONTHS,
  },
};

export function getStage(app: App): Stage {
  const stage = app.node.tryGetContext('stage');
  if (!stages.includes(stage)) {
    throw new Error(`Unknown stage "${stage}". Pass -c stage=<${stages.join('|')}>`);
  }
  return stage;
}

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
