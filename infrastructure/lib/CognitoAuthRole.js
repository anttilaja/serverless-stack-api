import { Construct } from 'constructs';
import { App, Stack} from 'aws-cdk-lib';     
import * as cdk from "aws-cdk-lib";              // core constructs
import { aws_cognito  as cognito, aws_iam as iam} from 'aws-cdk-lib';               // stable module
import * as codestar from '@aws-cdk/aws-codestar-alpha'; 
import * as sst from "@serverless-stack/resources";


export default class CognitoAuthRole extends Construct {
  // Public reference to the IAM role
  role;

  constructor(scope, id, props) {
    super(scope, id);

    const { identityPool } = props;

    // IAM role used for authenticated users
    this.role = new iam.Role(this, "CognitoDefaultAuthenticatedRole", {
      assumedBy: new iam.FederatedPrincipal(
        "cognito-identity.amazonaws.com",
        {
          StringEquals: {
            "cognito-identity.amazonaws.com:aud": identityPool.ref,
          },
          "ForAnyValue:StringLike": {
            "cognito-identity.amazonaws.com:amr": "authenticated",
          },
        },
        "sts:AssumeRoleWithWebIdentity"
      ),
    });
    this.role.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "mobileanalytics:PutEvents",
          "cognito-sync:*",
          "cognito-identity:*",
        ],
        resources: ["*"],
      })
    );

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      "IdentityPoolRoleAttachment",
      {
        identityPoolId: identityPool.ref,
        roles: { authenticated: this.role.roleArn },
      }
    );
  }
}
