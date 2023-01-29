import {
    APIGatewayProxyEvent,
    Context,
    APIGatewayProxyResult,
} from 'aws-lambda';
import { S3 } from 'aws-sdk';

// Environment var set in lib/api.ts
const bucketName = process.env.DOCUMENTS_BUCKET_NAME;
const s3 = new S3();

export const getDocuments = async (
    event: APIGatewayProxyEvent,
    context: Context
): Promise<APIGatewayProxyResult> => {
    console.log(`Bucket Name: ${bucketName}`);
    try {
        console.log(event.body, event.httpMethod, event.headers, event.pathParameters);

        const { Contents: results } = await s3.listObjects({Bucket: bucketName!}).promise()
        const documents = await Promise.all(results!.map(async object => await generateSignedUrls(object)));
        console.log(documents);
        return {
            statusCode: 200,
            body: JSON.stringify({body: event.body, method: event.httpMethod}),
        };
    } catch (err: any) {
        console.error(err);
        return {
            statusCode: 500,
            body: (err.message as string),
        };
     }

    
};

type SignedUrlResponse = {
    filename: string;
    url: string
};

const generateSignedUrls = async (object: S3.Object): Promise<SignedUrlResponse> => {
    const signedUrl = await s3.getSignedUrlPromise('getObject', {
        bucket: bucketName,
        Key: object.Key!,
        Expires: (60 * 60)
    })

    return {
        filename: object.Key!,
        url: signedUrl
    }
}
