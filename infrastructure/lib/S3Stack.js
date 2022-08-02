
import { Construct } from 'constructs';
import { App, Stack } from 'aws-cdk-lib';                 // core constructs
import { aws_s3 as s3 } from 'aws-cdk-lib';               // stable module
import * as codestar from '@aws-cdk/aws-codestar-alpha';  // experimental moduleimport { Construct } from 'constructs';
import * as sst from "@serverless-stack/resources";
import * as cdk from "aws-cdk-lib";


export default class S3Stack extends sst.Stack {
  // Public reference to the S3 bucket
  bucket;

  constructor(scope, id, props) {
    super(scope, id, props);

    this.bucket = new s3.Bucket(this, "Uploads", {
      // Allow client side access to the bucket from a different domain
      cors: [
        {
          maxAge: 3000,
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
          allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"]
        },
      ],
    });

    // Export values
    new cdk.CfnOutput(this, "AttachmentsBucketName", {
      value: this.bucket.bucketName,
    });
  }
}