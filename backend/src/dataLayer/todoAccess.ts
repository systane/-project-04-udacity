import * as AWS from 'aws-sdk';
import * as AWSXRAY from 'aws-xray-sdk';
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { TodoItem } from '../models/TodoItem';
import { TodoUpdate } from '../models/TodoUpdate';
import { S3 } from 'aws-sdk';
import { createLogger } from '../utils/logger';

const XAWS = AWSXRAY.captureAWS(AWS);

export class TodoAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly indexName = process.env.USER_ID_INDEX,
        private readonly s3: S3 = createS3Client(),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly signedUrlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION),
    ){};

    async getAllTodos(userId: string): Promise<TodoItem[]> {
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
        return items as TodoItem[];
    };

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        const logger = createLogger('createTodo');
        logger.info(`Creating a todo with id ${todo.todoId}`);

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        return todo;
    };

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
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

    async getTodo(todoId: string, userId: string): Promise<TodoItem> {
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
        return items[0] as TodoItem;
    };

    async createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
        const logger = createLogger('generateUploadUrl');
        logger.info('Creating presigned url');

        return await this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Expires: this.signedUrlExpiration,
            Key: `${todoId}_${userId}`
        });
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

function createS3Client() {
    if(process.env.IS_OFFLINE) {
        console.log('Creating a local s3 instance');
        return new AWS.S3({signatureVersion: 'v4'});
    }

    return new XAWS.S3({signatureVersion: 'v4'});
};