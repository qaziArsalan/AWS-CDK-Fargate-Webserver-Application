import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { DockerImageAsset } from 'aws-cdk-lib/aws-ecr-assets'
import { aws_ec2 as ec2, aws_ecs as ecs } from 'aws-cdk-lib';
import * as ecsp from 'aws-cdk-lib/aws-ecs-patterns'
import { aws_apigateway as apigw } from 'aws-cdk-lib';

import * as path from 'path'

// We need to pass the apiBase Url as environment var,
// plus, our webserver will be in VPC and it is used by Fargate
interface DocumentManagementWebserverProps { 
    vpc: ec2.IVpc;
    api: apigw.RestApi
}

export class DocumentManagementWebserver extends Construct {
    constructor(scope: Construct, id: string, props: DocumentManagementWebserverProps) {
        super(scope, id);

        const webserverDocker = new DockerImageAsset(this, 'WebserverDockerAsset', {
            directory: path.join(__dirname, '..', 'containers', 'webserver')
        });

        const fargateService = new ecsp.ApplicationLoadBalancedFargateService(this, 'WebserverService', {
            vpc: props.vpc,
            taskImageOptions: {
                image: ecs.ContainerImage.fromDockerImageAsset(webserverDocker),
                environment: {
                    SERVER_PORT: '8080',
                    API_BASE: props.api.url!
                },
                containerPort: 8080
            }
        });
        new cdk.CfnOutput(this, 'WebserverHost', {
            exportName: 'WebserverHost',
            value: fargateService.loadBalancer.loadBalancerDnsName
        });
        
    }
}
