import type { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { DynamoDbPersonRepository } from '../../repository/dynamodb-person';
import { CreatePersonUseCase } from '../../usecase/create-person';
import { CreatePersonHandler } from './handler';

const tableName = process.env.TABLE_NAME;
if (!tableName) {
  throw new Error('Missing TABLE_NAME');
}

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const personRepository = new DynamoDbPersonRepository(client, tableName);

const createPersonHandler = new CreatePersonHandler(new CreatePersonUseCase(personRepository));

export const handler = (event: APIGatewayProxyEvent) => createPersonHandler.handle(event);
