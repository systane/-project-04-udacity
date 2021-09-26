import { deleteImageGatewayGateway } from '../../gateway/s3/deleteImageGateway';
import { DeleteImageGatewayGatewayImpl } from '../../gateway/s3/impl/deleteImageGatewayImpl';
import { TodoRepository } from '../../repository/todoRepository';

const todoRepository = new TodoRepository();
const deleteImageGateway: deleteImageGatewayGateway = new DeleteImageGatewayGatewayImpl();

export async function deleteTodo(todoId: string, userId: string): Promise<void> {
    await todoRepository.deleteTodo(todoId, userId);
    const key = `${todoId}_${userId}`;
    await deleteImageGateway.execute(key);
};