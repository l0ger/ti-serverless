# First-time setup

For the scope of this assessment, and for simplicity, there is one AWS account per stage (test, prod), shared by the platform and all services. Do this once per stage. After that, pushing to any branch deploys to **test** and merging to `master` deploys to **prod**.

| Unit | Folder | Stack |
|---|---|---|
| Platform | `infra/` | `Platform-<stage>`, `GithubOidc-<stage>`, `GithubOidcProvider` (per account) |
| Person | `services/person/` | `Person-<stage>` |

You need: `nvm use && npm install`, AWS admin credentials for the target account, and admin access to the GitHub repo.

## 1. Set the account

Put the stage's account in every unit's env file, `<folder>/env/<stage>.env`:

```
AWS_ACCOUNT_ID=<account-id>
AWS_REGION=eu-central-1
```

## 2. Bootstrap

Runs `cdk bootstrap` for the stage's account and deploys two stacks, by hand, never by the pipeline:

- `GithubOidcProvider`: GitHub's OIDC provider, one per account. If test and prod share an account, the second bootstrap leaves it unchanged.
- `GithubOidc-<stage>`: the role `github-deploy-<stage>` that all pipelines of that stage log in with.

Once per stage, from the repository root:

```bash
npm run platform:bootstrap test          # or: prod
```

## 3. Deploy manually (optional)

The pipeline deploys on push; to deploy or inspect from your machine:

```bash
npm run person:synth test
npm run person:deploy test
```

## 4. Test

Push a change under the unit's folder to a non-`master` branch, then check **Actions** in GitHub (environment `test`) and **CloudFormation** in AWS.
