// import * as uuid from 'uuid';

import { TodoItem } from '../models/TodoItem';
import { TodoAccess } from '../dataLayer/todoAccess';
// import { CreateGroupRequest } from '../requests/CreateGroupRequest';
// import { getUserId } from '@libs/util';

const todoAccess = new TodoAccess();

//todo remover userId e alterar url de download do bucket
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    const todos = await todoAccess.getAllTodos(userId);
   return todos;
};

// export async function createGroup(
//     createGroupRequest: CreateGroupRequest,
//     jwtToken: string
// ): Promise<TodoItem> {
//     const itemId = uuid.v4();
//     const userId = getUserId(jwtToken);

//     return await todoAccess.createGroup({
//         id: itemId,
//         userId: userId,
//         name: createGroupRequest.name,
//         description: createGroupRequest.description,
//         timestamp: new Date().toISOString()
//     });
// };