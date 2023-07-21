# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template

![alt text](swclogo.jpg)
# swc_scripts
This repository contains various scripts. For additional details, please email at [christopher.sargent@sargentwalker.io](mailto:christopher.sargent@sargentwalker.io).

# CDK CasStackTest
1. ssh cas@172.18.0.193
2. sudo -i
3. mkdir /home/cas/multi-region-s3-crr-kms-cmk-target && cd /home/cas/multi-region-s3-crr-kms-cmk-target
4. cdk init lib --language=typescript
5. vim bin/multi-region-s3-crr-kms-cmk-target.ts
```
#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { MultiRegionS3CrrKmsCmkTarget } from '../lib/index';

// Create an instance of the CDK app.
const app = new cdk.App();

// Create a new CDK stack for the application.
const stack = new cdk.Stack(app, 'CasStackTest');

// Instantiate the MultiRegionS3CrrKmsCmkTarget construct and add it to the stack.
new MultiRegionS3CrrKmsCmkTarget(stack, 'MultiRegionS3CrrKmsCmkTarget', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
```
6. vim lib/index.ts
```
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

```
7. npm install && tsc
8. cdk synth
```
Resources:
  MultiRegionS3CrrKmsCmkTargetMyTargetKey5DE0EB36:
    Type: AWS::KMS::Key
    Properties:
      KeyPolicy:
        Statement:
          - Action: kms:*
            Effect: Allow
            Principal:
              AWS:
                Fn::Join:
                  - ""
                  - - "arn:"
                    - Ref: AWS::Partition
                    - ":iam::"
                    - Ref: AWS::AccountId
                    - :root
            Resource: "*"
        Version: "2012-10-17"
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
    Metadata:
      aws:cdk:path: CasStackTest/MultiRegionS3CrrKmsCmkTarget/MyTargetKey/Resource
  MultiRegionS3CrrKmsCmkTargetMyTargetBucketCE7D775A:
    Type: AWS::S3::Bucket
    Properties:
      BucketEncryption:
        ServerSideEncryptionConfiguration:
          - ServerSideEncryptionByDefault:
              KMSMasterKeyID:
                Fn::GetAtt:
                  - MultiRegionS3CrrKmsCmkTargetMyTargetKey5DE0EB36
                  - Arn
              SSEAlgorithm: aws:kms
      VersioningConfiguration:
        Status: Enabled
    UpdateReplacePolicy: Retain
    DeletionPolicy: Retain
    Metadata:
      aws:cdk:path: CasStackTest/MultiRegionS3CrrKmsCmkTarget/MyTargetBucket/Resource
  MultiRegionS3CrrKmsCmkTargetMyTargetKeyIdSSMParam7F33609F:
    Type: AWS::SSM::Parameter
    Properties:
      Description: The KMS Key Id for the target stack
      Name: CasStackTest.MyTargetKeyId
      Type: String
      Value:
        Fn::GetAtt:
          - MultiRegionS3CrrKmsCmkTargetMyTargetKey5DE0EB36
          - Arn
    Metadata:
      aws:cdk:path: CasStackTest/MultiRegionS3CrrKmsCmkTarget/MyTargetKeyIdSSMParam/Resource
  CDKMetadata:
    Type: AWS::CDK::Metadata
    Properties:
      Analytics: v2:deflate64:H4sIAAAAAAAA/z2LwQrCMBBEv6X3ZDUK0rM9epH2AySmq2xjEsimioT8uwkFTzPvDXOAvod9pz8szWzli+6Qp6SNFVXdsnUM+YJfMTx8jSL4CPm8Goupqa1Vy67dIvnnVUftMGFs+x9KaTgihzUabH0IfqZEwRfhw4yw8O6telAnUN3CRDKuPpFDGLf8AfxcIhCpAAAA
    Metadata:
      aws:cdk:path: CasStackTest/CDKMetadata/Default
    Condition: CDKMetadataAvailable
Conditions:
  CDKMetadataAvailable:
    Fn::Or:
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - af-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-northeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-1
          - Fn::Equals:
              - Ref: AWS::Region
              - ap-southeast-2
          - Fn::Equals:
              - Ref: AWS::Region
              - ca-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - cn-northwest-1
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-central-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-north-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-2
          - Fn::Equals:
              - Ref: AWS::Region
              - eu-west-3
          - Fn::Equals:
              - Ref: AWS::Region
              - me-south-1
          - Fn::Equals:
              - Ref: AWS::Region
              - sa-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-east-2
      - Fn::Or:
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-1
          - Fn::Equals:
              - Ref: AWS::Region
              - us-west-2
Parameters:
  BootstrapVersion:
    Type: AWS::SSM::Parameter::Value<String>
    Default: /cdk-bootstrap/hnb659fds/version
    Description: Version of the CDK Bootstrap resources in this environment, automatically retrieved from SSM Parameter Store. [cdk:skip]
Rules:
  CheckBootstrapVersion:
    Assertions:
      - Assert:
          Fn::Not:
            - Fn::Contains:
                - - "1"
                  - "2"
                  - "3"
                  - "4"
                  - "5"
                - Ref: BootstrapVersion
        AssertDescription: CDK bootstrap stack version 6 required. Please run 'cdk bootstrap' with a recent version of the CDK CLI.
```
9. cdk bootstrap
```
 ⏳  Bootstrapping environment aws://507370583167/us-east-1...
Trusted accounts for deployment: (none)
Trusted accounts for lookup: (none)
Using default execution policy of 'arn:aws:iam::aws:policy/AdministratorAccess'. Pass '--cloudformation-execution-policies' to customize.

 ✨ hotswap deployment skipped - no changes were detected (use --force to override)

 ✅  Environment aws://507370583167/us-east-1 bootstrapped (no changes).
```
10. cdk deploy
```
✨  Synthesis time: 7.31s

CasStackTest:  start: Building 4ccf75e8351198c314230252c319256e7bcd383b38c92357248c6d4c87bf2205:current_account-current_region
CasStackTest:  success: Built 4ccf75e8351198c314230252c319256e7bcd383b38c92357248c6d4c87bf2205:current_account-current_region
CasStackTest:  start: Publishing 4ccf75e8351198c314230252c319256e7bcd383b38c92357248c6d4c87bf2205:current_account-current_region
CasStackTest:  success: Published 4ccf75e8351198c314230252c319256e7bcd383b38c92357248c6d4c87bf2205:current_account-current_region
This deployment will make potentially sensitive changes according to your current security approval level (--require-approval broadening).
Please confirm you intend to make the following modifications:

IAM Statement Changes
┌───┬─────────────────────────────────────────────────┬────────┬────────┬───────────────────────────────────────────────────────┬───────────┐
│   │ Resource                                        │ Effect │ Action │ Principal                                             │ Condition │
├───┼─────────────────────────────────────────────────┼────────┼────────┼───────────────────────────────────────────────────────┼───────────┤
│ + │ ${MultiRegionS3CrrKmsCmkTarget/MyTargetKey.Arn} │ Allow  │ kms:*  │ AWS:arn:${AWS::Partition}:iam::${AWS::AccountId}:root │           │
└───┴─────────────────────────────────────────────────┴────────┴────────┴───────────────────────────────────────────────────────┴───────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Do you wish to deploy these changes (y/n)? y
CasStackTest: deploying... [1/1]
CasStackTest: creating CloudFormation changeset...

 ✅  CasStackTest

✨  Deployment time: 158.95s

Stack ARN:
arn:aws:cloudformation:us-east-1:507370583167:stack/CasStackTest/bf3d8b60-27f0-11ee-966a-121f6dcc11e3

✨  Total time: 166.25s
```
