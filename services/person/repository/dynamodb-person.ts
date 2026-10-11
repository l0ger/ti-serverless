import { type DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import type { Person } from '../domain/person';
import { type PersonRepository, PersonRepositoryError } from '../domain/person-repository';

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
  }
}
