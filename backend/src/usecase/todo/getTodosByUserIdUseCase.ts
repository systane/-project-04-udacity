import { TodoItemModel } from '../../models/TodoItemModel';
import { TodoRepository } from '../../repository/todoRepository';

const todoAccess = new TodoRepository();

export async function getTodosForUser(userId: string): Promise<TodoItemModel[]> {
    return await todoAccess.getAllTodos(userId);
};