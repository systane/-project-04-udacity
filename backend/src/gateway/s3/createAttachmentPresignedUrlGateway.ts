export interface createAttachmentPresignedUrlGateway {
    execute(todoId: string, userId: string): Promise<string>
}