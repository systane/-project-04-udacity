import { TodoRepository } from '../../repository/todoRepository';
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest';
import { TodoUpdateModel } from '../../models/TodoUpdateModel';

const todoRepository = new TodoRepository();

export async function updateTodo(
    userId: string,
    todoId: string,
    updateTodoRequest: UpdateTodoRequest
): Promise<void> {

    const todoUpdate = {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: true,
    } as TodoUpdateModel;
    await todoRepository.updateTodo(userId, todoId, todoUpdate);
};