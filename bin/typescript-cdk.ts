#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TypescriptCdkStack } from '../lib/typescript-cdk-stack';

const app = new cdk.App();
const myStack = new TypescriptCdkStack(app, 'TypescriptCdkStack');

cdk.Tags.of(myStack).add('App', 'DocumentsManagement');
cdk.Tags.of(myStack).add('Environment', 'Development');
