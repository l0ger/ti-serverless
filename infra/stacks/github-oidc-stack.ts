import { CfnOutput, Duration, Stack, type StackProps } from 'aws-cdk-lib';
import { PolicyStatement, Role, WebIdentityPrincipal } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';
import { GITHUB_OIDC_HOST, githubOidcProviderArn } from './github-oidc-provider-stack';

export interface GithubOidcStackProps extends StackProps {
  /** GitHub repository allowed to assume the role, as in the OIDC `sub` claim: `owner@<id>/repo@<id>`. */
  repository: string;
  /** GitHub environment the workflow job must run in (e.g. `prod`). */
  githubEnvironment: string;
}

/**
 * Stage-level: the deploy role GitHub Actions assumes for one stage, shared by the platform and all services.
 * Uses the account's GitHub OIDC provider (GithubOidcProviderStack).
 * Deployed manually, once per stage, never by the pipeline itself.
 */
export class GithubOidcStack extends Stack {
  constructor(scope: Construct, id: string, props: GithubOidcStackProps) {
    super(scope, id, props);

    const role = new Role(this, 'DeployRole', {
      roleName: `github-deploy-${props.githubEnvironment}`,
      description: `GitHub Actions deploy role for ${props.repository} (${props.githubEnvironment})`,
      maxSessionDuration: Duration.hours(1),
      assumedBy: new WebIdentityPrincipal(githubOidcProviderArn(this.account), {
        StringEquals: {
          [`${GITHUB_OIDC_HOST}:aud`]: 'sts.amazonaws.com',
          [`${GITHUB_OIDC_HOST}:sub`]: `repo:${props.repository}:environment:${props.githubEnvironment}`,
        },
      }),
    });

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
