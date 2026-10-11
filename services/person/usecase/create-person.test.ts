import type { EventPublisher } from 'shared/event-bridge-helper';
import type { PersonRepository } from '../domain/person-repository';
import { type CreatePersonParam, CreatePersonUseCase, CreatePersonUseCaseError } from './create-person';

const param: CreatePersonParam = {
  firstName: 'Jane',
  lastName: 'Doe',
  phoneNumber: '+31687654321',
  address: {
    street: 'Keizersgracht',
    houseNumber: '100',
    postalCode: '1015CV',
    city: 'Amsterdam',
    country: 'NL',
  },
};

const ULID = /^[0-9A-HJKMNP-TV-Z]{26}$/;

describe('CreatePersonUseCase', () => {
  let personRepository: jest.Mocked<PersonRepository>;
  let eventPublisher: jest.Mocked<EventPublisher>;
  let useCase: CreatePersonUseCase;

  beforeEach(() => {
    personRepository = { create: jest.fn().mockResolvedValue(undefined) };
    eventPublisher = { publish: jest.fn().mockResolvedValue(undefined) };
    useCase = new CreatePersonUseCase(personRepository, eventPublisher);
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a person with a ULID id and the given fields', async () => {
    const result = await useCase.execute(param);

    expect(result.id).toMatch(ULID);
    expect(result).toEqual({ id: result.id, ...param });
  });

  it('stores the person and publishes person-created-event with the same data', async () => {
    const result = await useCase.execute(param);

    expect(personRepository.create).toHaveBeenCalledWith(result);
    expect(eventPublisher.publish).toHaveBeenCalledWith('person-created-event', result);
    expect(personRepository.create.mock.invocationCallOrder[0]).toBeLessThan(
      eventPublisher.publish.mock.invocationCallOrder[0],
    );
  });

  it('copies only Person fields, so extra input never reaches storage or the event', async () => {
    const withExtra = { ...param, role: 'admin', address: { ...param.address, floor: '3' } } as CreatePersonParam;

    await useCase.execute(withExtra);

    const stored = personRepository.create.mock.calls[0][0];
    const published = eventPublisher.publish.mock.calls[0][1];
    expect(stored).not.toHaveProperty('role');
    expect(stored.address).not.toHaveProperty('floor');
    expect(published).not.toHaveProperty('role');
    expect(published.address).not.toHaveProperty('floor');
  });

  it('throws CreatePersonUseCaseError and publishes nothing when the repository fails', async () => {
    const cause = new Error('db down');
    personRepository.create.mockRejectedValue(cause);

    const error = await useCase.execute(param).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CreatePersonUseCaseError);
    expect((error as Error).cause).toBe(cause);
    expect(eventPublisher.publish).not.toHaveBeenCalled();
  });

  it('throws CreatePersonUseCaseError when publishing the event fails', async () => {
    const cause = new Error('bus down');
    eventPublisher.publish.mockRejectedValue(cause);

    const error = await useCase.execute(param).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(CreatePersonUseCaseError);
    expect((error as Error).cause).toBe(cause);
  });
});
