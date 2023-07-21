// The required AWS CDK modules and constructs are imported. These modules include kms, s3, and ssm, which provide functionality for AWS Key Management Service (KMS), Amazon S3, and AWS Systems Manager Parameter Store (SSM), respectively.
import { Construct } from 'constructs';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';

// This interface defines the properties that can be provided when creating an instance of the MultiRegionS3CrrKmsCmkTarget construct. Currently, there are no properties defined in this interface.
export interface MultiRegionS3CrrKmsCmkTargetProps {
}
	// Define the properties of your construct, in this step, the MultiRegionS3CrrKmsCmkTarget class is defined, which extends the Construct class from the constructs module. The construct takes three parameters: scope, id, and props. The props parameter allows you to pass properties to this construct, but currently, it is not used.
export class MultiRegionS3CrrKmsCmkTarget extends Construct {
  public readonly targetBucket: s3.Bucket;
  public readonly targetKeyIdSsmParameterName: string;
  constructor(scope: Construct, id: string, props: MultiRegionS3CrrKmsCmkTargetProps = {}) {
    super(scope, id);

    // Define construct contents here. KMS Key and S3 Bucket, In this step, the targetKmsKey is created using the kms.Key construct, and the targetBucket is created using the s3.Bucket construct. The bucket is configured to use server-side encryption with KMS (encryption: s3.BucketEncryption.KMS), and the targetKmsKey is specified as the encryption key for the bucket (encryptionKey: targetKmsKey). The bucket is also configured to be versioned (versioned: true).
    const targetKmsKey = new kms.Key(this, 'MyTargetKey');

    // s3 bucekt construct contents
    const targetBucket = new s3.Bucket(this, 'MyTargetBucket', {
      bucketName: cdk.PhysicalName.GENERATE_IF_NEEDED,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: targetKmsKey,
      versioned: true
    });

    // Creating an SSM Parameter, In this step, an SSM String Parameter is created using the ssm.StringParameter construct. The parameter's name is set based on the stack name (parameterName: ${stack.stackName}.MyTargetKeyId``), and the description is provided. The value of the parameter is set to the ARN of the targetKmsKey (KMS Key).
    const stack = cdk.Stack.of(this);
    const parameterName = `${stack.stackName}.MyTargetKeyId`;

    new ssm.StringParameter(this, 'MyTargetKeyIdSSMParam', {
      parameterName: parameterName,
      description: 'The KMS Key Id for the target stack',
      stringValue: targetKmsKey.keyArn
    });
    // Exporting the Construct's Properties, the properties of the construct (targetBucket and targetKeyIdSsmParameterName) are assigned values. These properties can be used later when using an instance of this construct.
    this.targetBucket = targetBucket;
    this.targetKeyIdSsmParameterName = parameterName;
  }
}
