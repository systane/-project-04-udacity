import { TodoRepository } from '../../repository/todoRepository';

const todoAccess = new TodoRepository();

export async function updateAttachmentUrl(imageId: string): Promise<void> {
    const index = imageId.indexOf('_');
    const todoId = imageId.substr(0, index);
    const userId = decodeURI(imageId.substr(index + 1));
    await todoAccess.updateAttachmentUrl(todoId, userId, imageId);
};