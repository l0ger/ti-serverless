import { CfnOutput, Duration, Stack, type StackProps } from 'aws-cdk-lib';
import { OidcProviderNative, PolicyStatement, Role, WebIdentityPrincipal } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

const GITHUB_OIDC_URL = 'https://token.actions.githubusercontent.com';
const GITHUB_OIDC_HOST = 'token.actions.githubusercontent.com';

export interface GithubOidcStackProps extends StackProps {
  /** GitHub repository allowed to assume the role, as `owner/repo`. */
  repository: string;
  /** GitHub environment the workflow job must run in (e.g. `prod`). */
  githubEnvironment: string;
}

/**
 * Account-level: one per stage account, shared by the platform and all services.
 * Deployed manually, once per account, never by the pipeline itself.
 */
export class GithubOidcStack extends Stack {
  constructor(scope: Construct, id: string, props: GithubOidcStackProps) {
    super(scope, id, props);

    const provider = new OidcProviderNative(this, 'GithubProvider', {
      url: GITHUB_OIDC_URL,
      clientIds: ['sts.amazonaws.com'],
    });

    const role = new Role(this, 'DeployRole', {
      roleName: `github-deploy-${props.githubEnvironment}`,
      description: `GitHub Actions deploy role for ${props.repository} (${props.githubEnvironment})`,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new WebIdentityPrincipal(provider.oidcProviderArn, {
        StringEquals: {
          [`${GITHUB_OIDC_HOST}:aud`]: 'sts.amazonaws.com',
          [`${GITHUB_OIDC_HOST}:sub`]: `repo:${props.repository}:environment:${props.githubEnvironment}`,
        },
      }),
    });

    // Only allowed to hand off to the CDK bootstrap roles, which do the actual deployment.
    role.addToPolicy(
      new PolicyStatement({
        actions: ['sts:AssumeRole'],
        resources: [`arn:aws:iam::${this.account}:role/cdk-hnb659fds-*`],
      }),
    );

    new CfnOutput(this, 'RoleArn', {
      value: role.roleArn,
      description: `Deploy role for GitHub environment "${props.githubEnvironment}"`,
    });
  }
}
