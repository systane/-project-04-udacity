import { S3 } from "aws-sdk";
import * as AWS from 'aws-sdk';
import * as AWSXRAY from 'aws-xray-sdk';
import { createLogger } from "../../../utils/logger";
import { createAttachmentPresignedUrlGateway } from "../createAttachmentPresignedUrlGateway";

const XAWS = AWSXRAY.captureAWS(AWS);

export class CreateAttachmentPresignedUrlGatewayImpl implements createAttachmentPresignedUrlGateway {

    constructor(
        private readonly logger = createLogger('generateUploadUrl'),
        private readonly s3: S3 = createS3Client(),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
        private readonly signedUrlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION),
    ){}
    
    async execute(key: string): Promise<string> {
        this.logger.info('Creating presigned url');
    
        return this.s3.getSignedUrl('putObject', {
            Bucket: this.bucketName,
            Expires: this.signedUrlExpiration,
            Key: key
        });
    };
}

export function createS3Client() {
    if(process.env.IS_OFFLINE) {
        console.log('Creating a local s3 instance');
        return new AWS.S3({signatureVersion: 'v4'});
    }

    return new XAWS.S3({signatureVersion: 'v4'});
};