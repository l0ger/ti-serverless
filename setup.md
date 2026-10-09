# First-time setup

Do this once per unit and stage. After that, pushing to any branch deploys to **test** and merging to `master` deploys to **prod**.

| Unit | Folder | GitHub environments |
|---|---|---|
| Platform | `infra/` | `platform-test`, `platform-prod` |
| Person Service | `services/person-service/` | `person-test`, `person-prod` |

You need: `nvm use && npm install`, AWS admin credentials for the target account, and admin access to the GitHub repo.

## 1. Set the account

Edit `<folder>/env/<stage>.env`:

```
AWS_ACCOUNT_ID=<account-id>
AWS_REGION=eu-central-1
```

## 2. Bootstrap CDK (once per account)

```bash
npx cdk bootstrap aws://<account-id>/eu-central-1
```

## 3. Deploy the GitHub OIDC stack

This creates the role the pipeline logs in with, so it is deployed by hand, never by the pipeline.

```bash
cd services/person-service   # or: cd infra
npx cdk deploy GithubOidc-PersonService-test -c stage=test   # or: GithubOidc-Platform-test
```

## 4. Test

Push a change under the unit's folder to a non-`master` branch, then check **Actions** in GitHub and **CloudFormation** in AWS.
