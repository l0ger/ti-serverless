import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';
import { ApiHandler, json } from './api-handler';

class KnownError extends Error {}

class GreetHandler extends ApiHandler<{ name: string }, { greeting: string }> {
  protected readonly schema = z.object({ name: z.string().min(1) });

  constructor(readonly execute: jest.Mock) {
    super();
  }

  protected override headers(): Record<string, string> {
    return { 'X-Greeted': 'yes' };
  }

  protected override errorResponse(error: unknown): APIGatewayProxyResult | undefined {
    return error instanceof KnownError ? json(418, { message: 'Known error' }) : undefined;
  }
}

function request(rawBody: string | null): APIGatewayProxyEvent {
  return { body: rawBody } as APIGatewayProxyEvent;
}

describe('ApiHandler', () => {
  let execute: jest.Mock;
  let handler: GreetHandler;

  beforeEach(() => {
    execute = jest.fn().mockResolvedValue({ greeting: 'Hello Jane' });
    handler = new GreetHandler(execute);
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the result as JSON with the default status and the handler headers', async () => {
    const response = await handler.handle(request(JSON.stringify({ name: 'Jane' })));

    expect(execute).toHaveBeenCalledWith({ name: 'Jane' });
    expect(response).toEqual({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json', 'X-Greeted': 'yes' },
      body: JSON.stringify({ greeting: 'Hello Jane' }),
    });
  });

  it('returns 400 when the body is missing or not JSON', async () => {
    for (const rawBody of [null, 'not-json']) {
      const response = await handler.handle(request(rawBody));

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body)).toEqual({ message: 'Request body must be valid JSON' });
    }
    expect(execute).not.toHaveBeenCalled();
  });

  it('returns 400 with the schema issues when the body is invalid', async () => {
    const response = await handler.handle(request(JSON.stringify({ name: '' })));

    expect(response.statusCode).toBe(400);
    const { message, issues } = JSON.parse(response.body);
    expect(message).toBe('Invalid request');
    expect(issues[0].path).toEqual(['name']);
    expect(execute).not.toHaveBeenCalled();
  });

  it('uses errorResponse for errors the handler knows', async () => {
    execute.mockRejectedValue(new KnownError());

    const response = await handler.handle(request(JSON.stringify({ name: 'Jane' })));

    expect(response.statusCode).toBe(418);
    expect(JSON.parse(response.body)).toEqual({ message: 'Known error' });
  });

  it('returns 500 with a generic message for any other error', async () => {
    execute.mockRejectedValue(new Error('db down'));

    const response = await handler.handle(request(JSON.stringify({ name: 'Jane' })));

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
  });
});
