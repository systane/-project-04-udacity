import { TodoRepository } from '../../repository/todoRepository';

const todoAccess = new TodoRepository();

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
    await todoAccess.deleteTodo(todoId, userId);
};