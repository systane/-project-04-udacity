import { TodoItemModel } from '../../models/TodoItemModel';
import { TodoRepository } from '../../repository/todoRepository';
import { CreateTodoRequest } from '../../requests/CreateTodoRequest';
import * as uuid from 'uuid';

const todoRepository = new TodoRepository();

export async function createTodo(
    createTodoRequest: CreateTodoRequest,
    userId: string
): Promise<TodoItemModel> {
    const todoId = uuid.v4();

    return await todoRepository.createTodo({
        todoId,
        userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        done: false,
        attachmentUrl: "",
        createdAt: new Date().toISOString(),
    });
};
