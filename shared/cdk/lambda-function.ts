import { RemovalPolicy } from 'aws-cdk-lib';
import { Architecture, LoggingFormat, Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction, type NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup, type RetentionDays } from 'aws-cdk-lib/aws-logs';
import type { Construct } from 'constructs';

export interface LambdaFunctionProps extends Omit<NodejsFunctionProps, 'logGroup' | 'logRetention'> {
  /** Path to the handler file (e.g. `apis/create-person/index.ts`). */
  entry: string;
  logRetention: RetentionDays;
  /** Applies to the function's log group. Defaults to DESTROY. */
  removalPolicy?: RemovalPolicy;
}

export class LambdaFunction extends NodejsFunction {
  constructor(scope: Construct, id: string, props: LambdaFunctionProps) {
    const { logRetention, removalPolicy = RemovalPolicy.DESTROY, environment, bundling, ...rest } = props;

    super(scope, id, {
      runtime: Runtime.NODEJS_24_X,
      architecture: Architecture.ARM_64,
      handler: 'handler',
      loggingFormat: LoggingFormat.JSON,
      logGroup: new LogGroup(scope, `${id}Logs`, { retention: logRetention, removalPolicy }),
      ...rest,
      environment: {
        NODE_OPTIONS: '--enable-source-maps',
        ...environment,
      },
      bundling: {
        minify: true,
        sourceMap: true,
        // Bundle the AWS SDK too instead of using the runtime's copy (Lambda recommendation).
        externalModules: [],
        ...bundling,
      },
    });
  }
}
