import * as AWS from 'aws-sdk';
import * as AWSXRAY from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../models/TodoItem';

const XAWS = AWSXRAY.captureAWS(AWS);

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.USER_ID_INDEX
    ){};

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        console.log('Getting all todos');

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            IndexName: this.indexName,
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise();

        const items = result.Items;
        return items as TodoItem[];
    };

    // async createTodo(todos: Todos): Promise<TodoItem> {
    //     console.log(`Creating a todo with id ${todo.id}`);

    //     await this.docClient.put({
    //         TableName: this.todosTable,
    //         Item: todo
    //     }).promise();

        
    //     return todo;
    // };
}

function createDynamoDBClient() {
    if(process.env.IS_OFFLINE) {
        console.log('Creating a local dynamodb instance');
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        });
    }
    return new XAWS.DynamoDB.DocumentClient();
}