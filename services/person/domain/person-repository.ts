import type { Person } from './person';

export interface PersonRepository {
  create(person: Person): Promise<void>;
}

export class PersonRepositoryError extends Error {
  override readonly name = 'PersonRepositoryError';

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
  }
}
