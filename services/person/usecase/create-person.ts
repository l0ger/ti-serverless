import type { EventPublisher } from 'shared/event-bridge-helper';
import { Person as PersonEventNames } from 'shared/events';
import { ulid } from 'ulid';
import type { Person } from '../domain/person';
import { PersonAlreadyExistsError, type PersonRepository } from '../domain/person-repository';

export type CreatePersonParam = Omit<Person, 'id'>;

export type CreatePersonResponse = Person;

export class CreatePersonUseCase {
  constructor(
    private readonly personRepository: PersonRepository,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(input: CreatePersonParam): Promise<CreatePersonResponse> {
    const person: Person = {
      id: ulid(),
      firstName: input.firstName,
      lastName: input.lastName,
      phoneNumber: input.phoneNumber,
      address: {
        street: input.address.street,
        houseNumber: input.address.houseNumber,
        postalCode: input.address.postalCode,
        city: input.address.city,
        country: input.address.country,
      },
    };
    try {
      await this.personRepository.create(person);
      await this.eventPublisher.publish(PersonEventNames.PERSON_CREATED_EVENT, toPersonCreatedEvent(person));
    } catch (error) {
      if (error instanceof PersonAlreadyExistsError) {
        throw error;
      }
      console.error('[CreatePersonUseCase] failed to create person', { personId: person.id, error });
      throw new CreatePersonUseCaseError({ cause: error });
    }
    console.debug('[CreatePersonUseCase] person created', { personId: person.id });
    return person;
  }
}

function toPersonCreatedEvent(person: Person): PersonEventNames.PersonCreatedEvent {
  return {
    id: person.id,
    firstName: person.firstName,
    lastName: person.lastName,
    phoneNumber: person.phoneNumber,
    address: {
      street: person.address.street,
      houseNumber: person.address.houseNumber,
      postalCode: person.address.postalCode,
      city: person.address.city,
      country: person.address.country,
    },
  };
}

export class CreatePersonUseCaseError extends Error {
  override readonly name = 'CreatePersonUseCaseError';

  constructor(options?: ErrorOptions) {
    super('Failed to create person', options);
  }
}
