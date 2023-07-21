import { Construct } from 'constructs';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Duration } from 'aws-cdk-lib';

export interface MultiRegionS3CrrKmsCmkTargetProps {
  // You can add any custom properties that need to be passed to the construct here.
}

export class MultiRegionS3CrrKmsCmkTarget extends Construct {
  public readonly targetBucket: s3.Bucket;
  public readonly targetKeyIdSsmParameterName: string;

  constructor(scope: Construct, id: string, props: MultiRegionS3CrrKmsCmkTargetProps = {}) {
    super(scope, id);

    // Define construct contents here using the "generated" syntax
    const generated: { [key: string]: any } = {};

    // Create the KMS Key with generated properties
    generated.enableKeyRotation = true;
    generated.keySpec = kms.KeySpec.SYMMETRIC_DEFAULT;
    generated.keyUsage = kms.KeyUsage.ENCRYPT_DECRYPT;
    generated.pendingWindow = Duration.days(30);

    const targetKmsKey = new kms.Key(this, 'MyTargetKey', generated);

    // Create the S3 Bucket with generated properties
    const targetBucket = new s3.Bucket(this, 'MyTargetBucket', {
      bucketName: cdk.PhysicalName.GENERATE_IF_NEEDED,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: targetKmsKey,
      versioned: true,
    });

    // Create an SSM Parameter to store the KMS Key ARN
    const stack = cdk.Stack.of(this);
    const parameterName = `${stack.stackName}.MyTargetKeyId`;

    new ssm.StringParameter(this, 'MyTargetKeyIdSSMParam', {
      parameterName: parameterName,
      description: 'The KMS Key Id for the target stack',
      stringValue: targetKmsKey.keyArn,
    });

    // Assign properties to the class fields
    this.targetBucket = targetBucket;
    this.targetKeyIdSsmParameterName = parameterName;
  }
}
