import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { type DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { type Person, personKey } from '../domain/person';
import { PersonAlreadyExistsError, type PersonRepository, PersonRepositoryError } from '../domain/person-repository';

/**
 * To keep it easy to understand, I have not used external ORM like OneTable
 * In Real-world application, I would use one to ensure consistency with DynamoDB types and reduce boilerplate code for interacting with DynamoDB.
 */
export class DynamoDbPersonRepository implements PersonRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  async create(person: Person): Promise<void> {
    try {
      await this.client.send(
        new PutCommand({
          TableName: this.tableName,
          Item: { pk: personKey(person), ...person },
          ConditionExpression: 'attribute_not_exists(pk)',
        }),
      );
    } catch (error) {
      if (error instanceof ConditionalCheckFailedException) {
        console.debug('[DynamoDbPersonRepository] person already exists', { tableName: this.tableName });
        throw new PersonAlreadyExistsError();
      }
      console.error('[DynamoDbPersonRepository] failed to create person', { personId: person.id, tableName: this.tableName, error });
      throw new PersonRepositoryError('Failed to store person', { cause: error });
    }
    console.debug('[DynamoDbPersonRepository] person created', { personId: person.id, tableName: this.tableName });
  }
}
