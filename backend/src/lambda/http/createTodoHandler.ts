import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../../utils/utils';
import { createTodo } from '../../usecase/todo/createTodoUseCase'
import { createLogger } from '../../utils/logger';

const logger = createLogger('createTodo');

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Starting process to create todo');

    const newTodo: CreateTodoRequest = JSON.parse(event.body)
    const userId = getUserId(event);
    const todo = await createTodo(newTodo, userId);

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({
        item: todo
      })
    };
    
  }
); 
