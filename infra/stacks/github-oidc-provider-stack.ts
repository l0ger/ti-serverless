import { Stack, type StackProps } from 'aws-cdk-lib';
import { OidcProviderNative } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

export const GITHUB_OIDC_HOST = 'token.actions.githubusercontent.com';

export function githubOidcProviderArn(account: string): string {
  return `arn:aws:iam::${account}:oidc-provider/${GITHUB_OIDC_HOST}`;
}

export class GithubOidcProviderStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    new OidcProviderNative(this, 'GithubProvider', {
      url: `https://${GITHUB_OIDC_HOST}`,
      clientIds: ['sts.amazonaws.com'],
    });
  }
}
