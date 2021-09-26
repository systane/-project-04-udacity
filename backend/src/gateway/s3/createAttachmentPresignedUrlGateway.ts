export interface createAttachmentPresignedUrlGateway {
    execute(key: string): Promise<string>
}