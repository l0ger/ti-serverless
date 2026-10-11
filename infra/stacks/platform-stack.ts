import { Stack, type StackProps } from 'aws-cdk-lib';
import { EventBus } from 'aws-cdk-lib/aws-events';
import type { Construct } from 'constructs';
import type { PlatformConfig } from '../config';

export interface PlatformStackProps extends StackProps {
  config: PlatformConfig;
}

export class PlatformStack extends Stack {
  readonly eventBus: EventBus;

  constructor(scope: Construct, id: string, props: PlatformStackProps) {
    super(scope, id, props);

    this.eventBus = new EventBus(this, 'EventBus', {
      eventBusName: `${props.config.name}-event-bus-${props.config.stage}`,
    });
  }
}
