import { App } from 'aws-cdk-lib';
import { getStage, requireEnv } from './stage';

describe('getStage', () => {
  it('returns the stage from CDK context', () => {
    expect(getStage(new App({ context: { stage: 'prod' } }))).toBe('prod');
  });

  it('rejects an unknown or missing stage', () => {
    expect(() => getStage(new App({ context: { stage: 'dev' } }))).toThrow('Unknown stage "dev"');
    expect(() => getStage(new App())).toThrow('Unknown stage "undefined"');
  });
});

describe('requireEnv', () => {
  afterEach(() => {
    delete process.env.ENV_HELPERS_TEST;
  });

  it('returns a set variable', () => {
    process.env.ENV_HELPERS_TEST = 'value';
    expect(requireEnv('ENV_HELPERS_TEST')).toBe('value');
  });

  it('throws when the variable is missing or empty', () => {
    expect(() => requireEnv('ENV_HELPERS_TEST')).toThrow('Missing ENV_HELPERS_TEST');
    process.env.ENV_HELPERS_TEST = '';
    expect(() => requireEnv('ENV_HELPERS_TEST')).toThrow('Missing ENV_HELPERS_TEST');
  });
});
