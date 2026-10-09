import { CfnOutput, Duration, Stack, type StackProps } from 'aws-cdk-lib';
import { OidcProviderNative, PolicyStatement, Role, WebIdentityPrincipal } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

const GITHUB_OIDC_URL = 'https://token.actions.githubusercontent.com';
const GITHUB_OIDC_HOST = 'token.actions.githubusercontent.com';

export interface GithubOidcStackProps extends StackProps {
  /** GitHub repository allowed to assume the role, as `owner/repo`. */
  repository: string;
  /** GitHub environment the workflow job must run in (e.g. `person-prod`). */
  githubEnvironment: string;
  /** Set to false when the account already has GitHub's OIDC provider; it is imported instead. */
  createProvider?: boolean;
}

/**
 * GitHub Actions deploy CDK apps into this account without stored AWS keys.
 * Deployed manually, once per account, never by the pipeline itself.
 */
export class GithubOidcStack extends Stack {
  constructor(scope: Construct, id: string, props: GithubOidcStackProps) {
    super(scope, id, props);

    const providerArn =
      props.createProvider === false
        ? `arn:aws:iam::${this.account}:oidc-provider/${GITHUB_OIDC_HOST}`
        : new OidcProviderNative(this, 'GithubProvider', {
            url: GITHUB_OIDC_URL,
            clientIds: ['sts.amazonaws.com'],
          }).oidcProviderArn;

    const role = new Role(this, 'DeployRole', {
      roleName: `github-deploy-${props.githubEnvironment}`,
      description: `GitHub Actions deploy role for ${props.repository} (${props.githubEnvironment})`,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new WebIdentityPrincipal(providerArn, {
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
      description: `Set as AWS_ROLE_ARN in GitHub environment "${props.githubEnvironment}"`,
    });
  }
}
