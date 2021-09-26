import { S3Event, SNSEvent, SNSHandler } from 'aws-lambda';
import 'source-map-support/register';

import { createLogger } from "../../utils/logger";
import { updateAttachmentUrl } from "../../usecase/todo/updateAttachmentUrlUseCase";

const logger = createLogger('updateUploadUrl');

//This handler reads events from SNS that are trigged by any upload of images done in the bucket
export const handler: SNSHandler = async (event: SNSEvent) => {
    logger.info('Processing SNS event ', JSON.stringify(event));

    for (const snsRecord of event.Records) {
        const s3EventStr = snsRecord.Sns.Message;
        logger.info('Processing S3 event', s3EventStr);
        const s3Event = JSON.parse(s3EventStr);

        await processS3Event(s3Event);
    }
};

async function processS3Event(s3Event: S3Event) {
    for (const record of s3Event.Records) {
        const imageId = record.s3.object.key;
        await updateAttachmentUrl(imageId);
    }
};