# ti-serverless

Serverless microservices on AWS, built with CDK. The first service is the **Person Service**: `POST /person` stores a person in DynamoDB and publishes a `person-created-event` to the platform event bus, so other microservices can react to it.

First-time setup (AWS account, bootstrap, GitHub deploy role) is described in [setup.md](setup.md).

## Directory structure

The repository is an npm workspaces monorepo
```
.
├── infra/                      Platform: shared infra as Platform and it hosts Github stack and event-bridge and it is deployable independently
│   ├── app.ts                  CDK app: platform-<stage>, platform-github-oidc-*
│   ├── config.ts               Per-stage platform config
│   ├── env/<stage>.env         AWS account and region per stage
│   └── stacks/
│       ├── platform-stack.ts               EventBridge bus platform-event-bus-<stage>
│       ├── github-oidc-provider-stack.ts   GitHub OIDC provider (one per account)
│       └── github-oidc-stack.ts            Deploy role platform-github-deploy-<stage>
├── services/
│   └── person/                 Person microservice (see "Microservice template")
├── shared/                    Helper libraries, event contracts and everything that are shared across microservices

├── .github/workflows/          CI/CD: person.yml, platform.yml, reusable _deploy.yml
├── jest.config.js               
├── tsconfig.json                
└── package.json                 
```


## Microservice template

Every microservice follows the layout of `services/person`

```
services/<name>/
├── domain/                     Entities and ports and shared domain rules
├── usecase/                    Application logic, depends only on domain and ports
├── repository/                 Adapters that implement domain ports
├── apis/<endpoint>/            One folder per API endpoint
│   ├── schema.ts               zod request schema and type
│   ├── handler.ts              Handler class extending ApiHandler
│   ├── handler.test.ts
│   └── index.ts                Composition root
├── env/
│   ├── environment.ts          zod schema for microservice environment variables
│   └── <stage>.env             AWS account and region per stage
├── infra/                      CDK app for this service
│   ├── app.ts
│   ├── config.ts               Per-stage config (log level, retention, removal policy, ...)
│   ├── <name>-data-stack.ts    Stateful resources (DynamoDB table)
│   └── <name>-stack.ts         Lambda, API Gateway, permissions
├── cdk.json
└── package.json
```


## Commands

Run all commands from the repository root with Node.js 24 (`nvm use`).

### Develop

| Command | Description |
|---|---|
| `npm install` | Install all workspaces |
| `npm run build` | Type-check everything (`tsc --noEmit`) |
| `npm test` | Run all unit tests (Jest) |

### Deploy

| Command | Description |
|---|---|
| `npm run platform:bootstrap <stage>` | CDK bootstrap and the GitHub OIDC stacks, once per stage |
| `npm run platform:deploy <stage>` | Deploy `platform-<stage>` |
| `npm run person:deploy <stage>` | Deploy `person-data-<stage>` and `person-<stage>` |

`<stage>` is `test` or `prod` and defaults to `test`. Deploy the platform before any service, because services publish to its event bus.

```bash
npm run platform:deploy test
npm run person:deploy test
```


## CI/CD

GitHub Actions runs one workflow per deployable unit: `person.yml` for `services/person` and `platform.yml` for `infra`. A workflow runs when files in its folder, `shared/` or the root config change.

| Trigger | Stage |
|---|---|
| Push to any branch except `master` | `test` |
| Merge to `master` | `prod` |

Each run has two jobs from `_deploy.yml`:
 
 