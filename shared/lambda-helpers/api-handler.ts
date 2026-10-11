import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { z } from 'zod';

export abstract class ApiHandler<TRequest, TResponse> {
  protected abstract readonly schema: z.ZodType<TRequest>;
  protected readonly statusCode: number = 200;

  protected abstract execute(request: TRequest): Promise<TResponse>;

  protected headers(_response: TResponse): Record<string, string> {
    return {};
  }

  async handle(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    let body: unknown;
    try {
      body = JSON.parse(event.body ?? '');
    } catch {
      return json(400, { message: 'Request body must be valid JSON' });
    }

    const parsed = this.schema.safeParse(body);
    if (!parsed.success) {
      return json(400, { message: 'Invalid request', issues: parsed.error.issues });
    }

    try {
      const result = await this.execute(parsed.data);
      return json(this.statusCode, result, this.headers(result));
    } catch (error) {
      console.error('[ApiHandler] request failed', error);
      return json(500, { message: 'Internal server error' });
    }
  }
}

function json(statusCode: number, body: unknown, headers: Record<string, string> = {}): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  };
}
