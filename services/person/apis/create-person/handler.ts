import type { APIGatewayProxyResult } from 'aws-lambda';
import { ApiHandler, json } from 'shared/lambda-helpers';
import { PersonAlreadyExistsError } from '../../domain/person-repository';
import type { CreatePersonResponse, CreatePersonUseCase } from '../../usecase/create-person';
import { CreatePersonRequest } from './schema';

export class CreatePersonHandler extends ApiHandler<CreatePersonRequest, CreatePersonResponse> {
  protected readonly schema = CreatePersonRequest;
  protected override readonly statusCode = 201;

  constructor(private readonly createPerson: CreatePersonUseCase) {
    super();
  }

  protected execute(request: CreatePersonRequest): Promise<CreatePersonResponse> {
    return this.createPerson.execute(request);
  }

  protected override headers(person: CreatePersonResponse): Record<string, string> {
    return { Location: `/person/${person.id}` };
  }

  protected override errorResponse(error: unknown): APIGatewayProxyResult | undefined {
    if (error instanceof PersonAlreadyExistsError) {
      return json(409, { message: 'Person already exists' });
    }
    return undefined;
  }
}
