import * as cdk from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { aws_s3 as s3 } from 'aws-cdk-lib';
import * as apig from 'aws-cdk-lib/aws-apigateway';

import * as path from 'path';

interface DocumentManagementAPIProps {
	documentBucket: s3.IBucket;
}

export class DocumentsManagementAPI extends Construct {
	public readonly restApi:  apig.RestApi
	constructor(scope: Construct, id: string, props: DocumentManagementAPIProps) {
		super(scope, id);

		const getDocumentsFunction = new lambda.NodejsFunction(
			this,
			'GetDocumentsFunction',
			{
				runtime: Runtime.NODEJS_16_X,
				entry: path.join(__dirname, '..', 'api', 'getDocuments', 'index.ts'),
				handler: 'getDocuments',
				bundling: {
					externalModules: ['aws-sdk'],
				},
				environment: {
					DOCUMENTS_BUCKET_NAME: props.documentBucket.bucketName,
				},
			}
		);

		const bucketPermission = new iam.PolicyStatement();
		bucketPermission.addResources(`${props.documentBucket.bucketArn}/*`);
		bucketPermission.addActions('s3:GetObject', 's3:PutObject');
		getDocumentsFunction.addToRolePolicy(bucketPermission);

		const bucketContainerPermissions = new iam.PolicyStatement();
		bucketContainerPermissions.addResources(`${props.documentBucket.bucketArn}`);
		bucketContainerPermissions.addActions('s3:ListBucket')
		getDocumentsFunction.addToRolePolicy(bucketContainerPermissions);
		
		// Setting up the APIGateway so that we can access the Lambda via URL
		this.restApi = new apig.RestApi(this, 'RestAPI', {
			restApiName: 'documents-management-api',
		});
		
		this.restApi.root.addCorsPreflight({
			allowOrigins: ['*']
		});
		const documents = this.restApi.root.addResource('documents');
		const integration = new apig.LambdaIntegration(getDocumentsFunction);
		documents.addMethod('GET', integration);
		documents.addMethod('POST', integration);
		
		new cdk.CfnOutput(this, 'APIEnpoint', {
			value: this.restApi.url!,
			exportName: 'APIEndPoint'
		})

	}
}

// for local bundling we have to $ npm install --save-dev esbuild@0
// in root directory fo project
