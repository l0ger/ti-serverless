import { Stack, type StackProps } from 'aws-cdk-lib';
import { AttributeType, TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import type { Construct } from 'constructs';
import type { PersonConfig } from './config';

export interface PersonDataStackProps extends StackProps {
  config: PersonConfig;
}

export class PersonDataStack extends Stack {
  readonly table: TableV2;

  constructor(scope: Construct, id: string, props: PersonDataStackProps) {
    super(scope, id, { ...props, terminationProtection: props.config.protectData });
    this.table = new TableV2(this, 'PersonTable', {
      partitionKey: { name: 'id', type: AttributeType.STRING },
      removalPolicy: props.config.removalPolicy,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: props.config.pointInTimeRecovery },
    });
  }
}
