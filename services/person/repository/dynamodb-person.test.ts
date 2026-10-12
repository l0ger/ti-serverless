import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { type DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { Person } from '../domain/person';
import { PersonAlreadyExistsError, PersonRepositoryError } from '../domain/person-repository';
import { DynamoDbPersonRepository } from './dynamodb-person';

const person: Person = {
  id: '01M4NQCFXMXAXQNA882BA0BGAS',
  firstName: 'Jane',
  lastName: 'Doe',
  phoneNumber: '+31687654321',
  address: { street: 'Keizersgracht', houseNumber: '100', postalCode: '1015CV', city: 'Amsterdam', country: 'NL' },
};

describe('DynamoDbPersonRepository', () => {
  let send: jest.Mock;
  let repository: DynamoDbPersonRepository;

  beforeEach(() => {
    send = jest.fn().mockResolvedValue({});
    repository = new DynamoDbPersonRepository({ send } as unknown as DynamoDBDocumentClient, 'person-table');
    jest.spyOn(console, 'error').mockImplementation(() => {});
    jest.spyOn(console, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });


  it('throws PersonAlreadyExistsError when the person already exists', async () => {
    send.mockRejectedValue(new ConditionalCheckFailedException({ message: 'The conditional request failed', $metadata: {} }));

    const error = await repository.create(person).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(PersonAlreadyExistsError);
  });

  it('throws PersonRepositoryError when the client call fails', async () => {
    const cause = new Error('db down');
    send.mockRejectedValue(cause);

    const error = await repository.create(person).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(PersonRepositoryError);
    expect((error as Error).cause).toBe(cause);
  });
});
