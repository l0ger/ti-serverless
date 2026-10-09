import { Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import type { PlatformConfig } from '../config';

export interface PlatformStackProps extends StackProps {
  config: PlatformConfig;
}

export class PlatformStack extends Stack {
  constructor(scope: Construct, id: string, props: PlatformStackProps) {
    super(scope, id, props);
  }
}
