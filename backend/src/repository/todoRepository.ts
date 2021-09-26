import * as AWS from 'aws-sdk';
import * as AWSXRAY from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItemModel } from '../models/TodoItemModel';
import { TodoUpdateModel } from '../models/TodoUpdateModel';
import { createLogger } from '../utils/logger';

const XAWS = AWSXRAY.captureAWS(AWS);

export class TodoRepository {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.USER_ID_INDEX,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    ){};

    async getAllTodos(userId: string): Promise<TodoItemModel[]> {
        const logger = createLogger('getAllTodos'); 
        logger.info('Getting all todos');

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            IndexName: this.indexName,
            ExpressionAttributeValues: {
                ':userId': userId
            },
            ProjectionExpression: 'todoId, createdAt, #name, dueDate, done, attachmentUrl',
            ExpressionAttributeNames: {
                '#name': 'name'
            },
        }).promise();

        const items = result.Items;
        return items as TodoItemModel[];
    };

    async createTodo(todo: TodoItemModel): Promise<TodoItemModel> {
        const logger = createLogger('createTodo');
        logger.info(`Creating a todo with id ${todo.todoId}`);

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        return todo;
    };

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdateModel): Promise<TodoUpdateModel> {
        const logger = createLogger('updateTodo');
        logger.info(`Updating a todo with name ${todoUpdate.name}`);

        const todoSaved = await this.getTodo(todoId, userId);

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                createdAt: todoSaved.createdAt
            },
            ConditionExpression: 'todoId = :todoId',
            UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done,
                ':todoId': todoId
            },
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ReturnValues: 'UPDATED_NEW'
        }).promise();

        
        return todoUpdate;
    };

    async deleteTodo(todoId: string, userId: string): Promise<void> {
        const logger = createLogger('deleteTodo');
        logger.info('Deleting todo');

        const todoToDelete = await this.getTodo(todoId, userId);

       await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                userId,
                createdAt: todoToDelete.createdAt
            },
            ConditionExpression: 'todoId = :todoId',
            ExpressionAttributeValues: {
                ':todoId': todoId
            }
        }).promise();
    };

    async getTodo(todoId: string, userId: string): Promise<TodoItemModel> {
        const logger = createLogger('getTodo'); 
        logger.info('Getting todos by todoid and userId');

        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'todoId = :todoId and userId = :userId',
            IndexName: this.indexName,
            ExpressionAttributeValues: {
                ':todoId': todoId,
                ':userId': userId
            }
        }).promise();

        const items = result.Items;
        return items[0] as TodoItemModel;
    };

    async updateAttachmentUrl(todoId: string, userId: string, imageId: string): Promise<void> {
        const logger = createLogger('updateAttachmentUrl');
        logger.info('Updating attachmentUrl');
        
        const todo = await this.getTodo(todoId, userId);

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId,
                createdAt: todo.createdAt
            },
            ConditionExpression: 'todoId = :todoId',
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
              ':attachmentUrl': `https://${this.bucketName}.s3.amazonaws.com/${imageId}`,
              ':todoId': todoId,
            },
        }).promise();
    };
}

function createDynamoDBClient() {
    if(process.env.IS_OFFLINE) {
        console.log('Creating a local dynamodb instance');
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        });
    }

    return new AWS.DynamoDB.DocumentClient();
};