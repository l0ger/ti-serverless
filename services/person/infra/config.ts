import { RemovalPolicy, type Environment } from 'aws-cdk-lib';
import { ApplicationLogLevel } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { requireEnv, type Stage } from 'shared/env-helpers';

export interface PersonConfig {
  name: string;
  stage: Stage;
  env: Required<Environment>;
  removalPolicy: RemovalPolicy;
  pointInTimeRecovery: boolean;
  protectData: boolean;
  logRetention: RetentionDays;
  logLevel: ApplicationLogLevel;
  platformEventBusName: string;
}

const configs: Record<Stage, Omit<PersonConfig, 'env'>> = {
  test: {
    name: 'person',
    stage: 'test',
    removalPolicy: RemovalPolicy.DESTROY,
    pointInTimeRecovery: false,
    protectData: false,
    logRetention: RetentionDays.ONE_WEEK,
    logLevel: ApplicationLogLevel.DEBUG,
    platformEventBusName: 'platform-event-bus-test',
  },
  prod: {
    name: 'person',
    stage: 'prod',
    removalPolicy: RemovalPolicy.RETAIN,
    pointInTimeRecovery: true,
    protectData: true,
    logRetention: RetentionDays.THREE_MONTHS,
    logLevel: ApplicationLogLevel.INFO,
    platformEventBusName: 'platform-event-bus-prod',
  },
};

export function getPersonConfig(stage: Stage): PersonConfig {
  process.loadEnvFile(new URL(`../env/${stage}.env`, import.meta.url));
  return {
    ...configs[stage],
    env: { account: requireEnv('AWS_ACCOUNT_ID'), region: requireEnv('AWS_REGION') },
  };
}
