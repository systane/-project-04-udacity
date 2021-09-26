import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'

import { updateTodo } from '../../usecase/todo/updateTodoUseCase'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { getUserId } from '../../utils/utils';
import { createLogger } from '../../utils/logger';

const logger = createLogger('updateTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Starting process to update todo');

    const userId = getUserId(event);
    const todoId = event.pathParameters.todoId;
    const updatedTodo: UpdateTodoRequest = JSON.parse(event.body);
    await updateTodo(userId, todoId, updatedTodo);

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: null
    };
    
  }
); 