import { TodoItemModel } from '../../models/TodoItemModel';
import { TodoRepository } from '../../repository/todoRepository';

const todoRepository = new TodoRepository();

export async function getTodosForUser(userId: string): Promise<TodoItemModel[]> {
    return await todoRepository.getAllTodos(userId);
};