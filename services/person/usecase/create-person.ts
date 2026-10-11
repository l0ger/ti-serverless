import { ulid } from 'ulid';
import type { Person } from '../domain/person';
import type { PersonRepository } from '../domain/person-repository';

export type CreatePersonParam = Omit<Person, 'id'>;

export type CreatePersonResult = Person;

export class CreatePersonUseCase {
  constructor(private readonly personRepository: PersonRepository) {}

  async execute(input: CreatePersonParam): Promise<CreatePersonResult> {
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
    } catch (error) {
      console.error('[CreatePersonUseCase] failed to create person', { personId: person.id, error });
      throw new CreatePersonUseCaseError({ cause: error });
    }
    return person;
  }
}

export class CreatePersonUseCaseError extends Error {
  override readonly name = 'CreatePersonUseCaseError';

  constructor(options?: ErrorOptions) {
    super('Failed to create person', options);
  }
}
