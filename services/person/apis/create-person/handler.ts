import { ApiHandler } from 'shared/lambda-helpers';
import type { CreatePersonParam, CreatePersonResult as CreatePersonResponse, CreatePersonUseCase } from '../../usecase/create-person';
import { CreatePersonRequest } from './schema';

export class CreatePersonHandler extends ApiHandler<typeof CreatePersonRequest, CreatePersonResponse> {
  protected readonly schema = CreatePersonRequest;
  protected override readonly statusCode = 201;

  constructor(private readonly createPerson: CreatePersonUseCase) {
    super();
  }

  protected execute(param: CreatePersonParam): Promise<CreatePersonResponse> {
    return this.createPerson.execute(param);
  }

  protected override headers(person: CreatePersonResponse): Record<string, string> {
    return { Location: `/person/${person.id}` };
  }
}
