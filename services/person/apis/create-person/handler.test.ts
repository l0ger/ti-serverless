import type { APIGatewayProxyEvent } from 'aws-lambda';
import type { CreatePersonResult, CreatePersonUseCase } from '../../usecase/create-person';
import { CreatePersonHandler } from './handler';

const body = {
  firstName: '  Jane ',
  lastName: 'Doe',
  phoneNumber: '+31687654321',
  address: {
    street: 'Keizersgracht',
    houseNumber: '100',
    postalCode: '1015CV',
    city: 'Amsterdam',
    country: 'nl',
  },
};

const person: CreatePersonResult = {
  id: '01M4NQCFXMXAXQNA882BA0BGAS',
  firstName: 'Jane',
  lastName: 'Doe',
  phoneNumber: '+31687654321',
  address: { street: 'Keizersgracht', houseNumber: '100', postalCode: '1015CV', city: 'Amsterdam', country: 'NL' },
};

function request(rawBody: string | null): APIGatewayProxyEvent {
  return { body: rawBody } as APIGatewayProxyEvent;
}

describe('CreatePersonHandler', () => {
  let execute: jest.Mock;
  let handler: CreatePersonHandler;

  beforeEach(() => {
    execute = jest.fn().mockResolvedValue(person);
    handler = new CreatePersonHandler({ execute } as unknown as CreatePersonUseCase);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 201 with the person and a Location header', async () => {
    const response = await handler.handle(request(JSON.stringify(body)));

    expect(response.statusCode).toBe(201);
    expect(JSON.parse(response.body)).toEqual(person);
    expect(response.headers).toEqual({ 'Content-Type': 'application/json', Location: `/person/${person.id}` });
  });

  it('passes the trimmed and normalized input to the use case', async () => {
    await handler.handle(request(JSON.stringify(body)));

    expect(execute).toHaveBeenCalledWith({
      ...body,
      firstName: 'Jane',
      address: { ...body.address, country: 'NL' },
    });
  });

  it('returns 400 when the body is not JSON', async () => {
    const response = await handler.handle(request('not-json'));

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body)).toEqual({ message: 'Request body must be valid JSON' });
    expect(execute).not.toHaveBeenCalled();
  });

  it('returns 400 with issues when a field is missing or invalid', async () => {
    const { lastName: _lastName, ...withoutLastName } = body;
    const response = await handler.handle(request(JSON.stringify({ ...withoutLastName, phoneNumber: '123' })));

    expect(response.statusCode).toBe(400);
    const { message, issues } = JSON.parse(response.body);
    expect(message).toBe('Invalid request');
    expect(issues.map((issue: { path: string[] }) => issue.path.join('.'))).toEqual(
      expect.arrayContaining(['lastName', 'phoneNumber']),
    );
    expect(execute).not.toHaveBeenCalled();
  });

  it('returns 500 with a generic message when the use case fails', async () => {
    execute.mockRejectedValue(new Error('db down'));

    const response = await handler.handle(request(JSON.stringify(body)));

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toEqual({ message: 'Internal server error' });
  });
});
