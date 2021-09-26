import { S3 } from "aws-sdk";
import * as AWS from 'aws-sdk';
import * as AWSXRAY from 'aws-xray-sdk';
import { createLogger } from "../../../utils/logger";
import { deleteImageGatewayGateway } from "../deleteImageGateway";

const XAWS = AWSXRAY.captureAWS(AWS);

export class DeleteImageGatewayGatewayImpl implements deleteImageGatewayGateway {

    constructor(
        private readonly logger = createLogger('deleteImage'),
        private readonly s3: S3 = createS3Client(),
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    ){}
    
    async execute(key: string): Promise<void> {
        this.logger.info('Deleting image from bucket');
    
        await this.s3.deleteObject({
            Bucket: this.bucketName,
            Key: key
        }).promise();
    };
}

export function createS3Client() {
    if(process.env.IS_OFFLINE) {
        console.log('Creating a local s3 instance');
        return new AWS.S3({signatureVersion: 'v4'});
    }

    return new XAWS.S3({signatureVersion: 'v4'});
};