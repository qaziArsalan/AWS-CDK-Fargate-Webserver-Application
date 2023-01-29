import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';

import { Networking } from './networking';
import { DocumentsManagementAPI } from './api';
import { DocumentManagementWebserver } from './webserver';

export class TypescriptCdkStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: cdk.StackProps) {
		super(scope, id, props);

		const bucket = new Bucket(this, 'DocumentsBucket', {
			encryption: BucketEncryption.S3_MANAGED,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
			autoDeleteObjects: true,
		});

		new cdk.CfnOutput(this, 'DocmentsBucketNameExport', {
			value: bucket.bucketName,
			exportName: 'DocumentsBucketName',
		});

		const networking = new Networking(this, 'NetworkingConstruct', {
			maxAzs: 2,
		});
		// Tagging theb while networking construct
		cdk.Tags.of(networking).add('Module', 'Networking');

		const api = new DocumentsManagementAPI(this, 'DocumentManagementAPI', {
			documentBucket: bucket,
		});
		cdk.Tags.of(api).add('Module', 'API');

		const webserver = new DocumentManagementWebserver(this, 'DocumentManagementWebserver', {
			vpc: networking.vpc,
			api: api.restApi
		});
		cdk.Tags.of(webserver).add('Module', 'WebServer');
	}
}


// add a tag to stack, construct or a resource, use cdk.Tags.of(Construct).add(name, value)