import { Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import type { PersonConfig } from './config';

export interface PersonStackProps extends StackProps {
  config: PersonConfig;
}

/** Resources owned by the person service only. */
export class PersonStack extends Stack {
  constructor(scope: Construct, id: string, props: PersonStackProps) {
    super(scope, id, props);
  }
}
