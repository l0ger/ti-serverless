# First-time setup

Do this once per unit and stage. After that, pushing to any branch deploys to **test** and merging to `master` deploys to **prod**.

| Unit | Folder | GitHub environments |
|---|---|---|
| Platform | `infra/` | `platform-test`, `platform-prod` |
| Person | `services/person/` | `person-test`, `person-prod` |

You need: `nvm use && npm install`, AWS admin credentials for the target account, and admin access to the GitHub repo.

## 1. Set the account

Edit `<folder>/env/<stage>.env`:

```
AWS_ACCOUNT_ID=<account-id>
AWS_REGION=eu-central-1
```

## 2. Bootstrap

For the scope of this assessment, and for simplicity I assume we only want have account per stage. Running bootstrap command per stage for one of services is enough for creation of GitHub OIDC role.

Runs `cdk bootstrap` for the stage's account and deploys the GitHub OIDC stack (the role the pipeline logs in with, so it is deployed by hand, never by the pipeline). From the repository root:

```bash
npm run platform:bootstrap test          # or: prod
npm run person:bootstrap test    # or: prod
```

## 3. Deploy manually (optional)

The pipeline deploys on push; to deploy or inspect from your machine:

```bash
npm run person:synth test
npm run person:deploy test
```

## 4. Test

Push a change under the unit's folder to a non-`master` branch, then check **Actions** in GitHub and **CloudFormation** in AWS.
