import { randomUUID } from 'node:crypto';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreatePersonRequest } from './schema';

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  let body: unknown;
  try {
    body = JSON.parse(event.body ?? '');
  } catch {
    return json(400, { message: 'Request body must be valid JSON' });
  }

  const result = CreatePersonRequest.safeParse(body);
  if (!result.success) {
    return json(400, { message: 'Invalid request', issues: result.error.issues });
  }

  const person = { id: randomUUID(), ...result.data };
  // TODO: save to DynamoDB, publish person-created event

  return json(201, person, { Location: `/person/${person.id}` });
}

function json(statusCode: number, body: unknown, headers: Record<string, string> = {}): APIGatewayProxyResult {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  };
}
