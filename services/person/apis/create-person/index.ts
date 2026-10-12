import type { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { EventBridgeClient } from '@aws-sdk/client-eventbridge';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { EventBus } from 'shared/event-bridge-helper';
import { loadEnv } from 'shared/lambda-helpers';
import { DynamoDbPersonRepository } from '../../repository/dynamodb-person';
import { CreatePersonUseCase } from '../../usecase/create-person';
import { PersonEnvironment } from '../../env/environment';
import { CreatePersonHandler } from './handler';

const env = loadEnv(PersonEnvironment);
// For scope of this assignment, I have not used dependency injection framework,
// But in a real-world application, I would use one for example tsyringe to manage dependencies and improve testability. 
const personRepository = new DynamoDbPersonRepository(DynamoDBDocumentClient.from(new DynamoDBClient({})), env.TABLE_NAME);
const eventBus = new EventBus(new EventBridgeClient({}), env.PLATFORM_EVENT_BUS_NAME, env.SERVICE_NAME);

const createPersonHandler = new CreatePersonHandler(new CreatePersonUseCase(personRepository, eventBus));

export const handler = (event: APIGatewayProxyEvent) => createPersonHandler.handle(event);
