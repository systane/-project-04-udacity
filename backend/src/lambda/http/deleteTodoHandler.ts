import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'

import { deleteTodo } from '../../usecase/todo/deleteTodoUseCase'
import { getUserId } from '../../utils/utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('deleteTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Starting process to delete todo');

    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);

    await deleteTodo(todoId, userId);
    
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: null
    };
  }
)
