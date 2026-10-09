import { Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import type { PersonServiceConfig } from './config';

export interface PersonServiceStackProps extends StackProps {
  config: PersonServiceConfig;
}

/** Resources owned by the Person Service only. */
export class PersonServiceStack extends Stack {
  constructor(scope: Construct, id: string, props: PersonServiceStackProps) {
    super(scope, id, props);
  }
}
