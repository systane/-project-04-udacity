import { createAttachmentPresignedUrlGateway } from '../../gateway/s3/createAttachmentPresignedUrlGateway';
import { CreateAttachmentPresignedUrlGatewayImpl } from '../../gateway/s3/impl/createAttachmentPresignedUrlImplGatewayImpl';

const createAttachmentPresignedUrlGateway: createAttachmentPresignedUrlGateway = new CreateAttachmentPresignedUrlGatewayImpl();

export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    const key = `${todoId}_${userId}`;
    return await createAttachmentPresignedUrlGateway.execute(key);
};