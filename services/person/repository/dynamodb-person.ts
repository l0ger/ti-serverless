import { type DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { Person } from '../domain/person';
import { type PersonRepository, PersonRepositoryError } from '../domain/person-repository';

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
          Item: person,
          ConditionExpression: 'attribute_not_exists(id)',
        }),
      );
    } catch (error) {
      console.error('[DynamoDbPersonRepository] failed to create person', { personId: person.id, tableName: this.tableName, error });
      throw new PersonRepositoryError('Failed to store person', { cause: error });
    }
    console.debug('[DynamoDbPersonRepository] person created', { personId: person.id, tableName: this.tableName });
  }
}
