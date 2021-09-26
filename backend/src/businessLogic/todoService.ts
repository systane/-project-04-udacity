import { TodoItem } from '../models/TodoItem';
import { TodoAccess } from '../dataLayer/todoAccess';
import { CreateTodoRequest } from '../requests/CreateTodoRequest';
import * as uuid from 'uuid';
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest';
import { TodoUpdate } from '../models/TodoUpdate';

const todoAccess = new TodoAccess();

export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    const todos = await todoAccess.getAllTodos(userId);
   return todos;
};

//todo: remover userId
export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItem> {
    const todoId = uuid.v4();

    return await todoAccess.createTodo({
        todoId,
        userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: "",
        createdAt: new Date().toISOString(),
    });
};

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<void> {

    const todoUpdate = {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: true,
    } as TodoUpdate;
    await todoAccess.updateTodo(userId, todoId, todoUpdate);
};

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
    await todoAccess.deleteTodo(todoId, userId);
};

export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    return await todoAccess.createAttachmentPresignedUrl(todoId, userId);
};

export async function updateAttachmentUrl(imageId: string): Promise<void> {
    const index = imageId.indexOf('_');
    const todoId = imageId.substr(0, index);
    const userId = decodeURI(imageId.substr(index + 1));
    await todoAccess.updateAttachmentUrl(todoId, userId, imageId);
};