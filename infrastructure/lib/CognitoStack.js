
import { Construct } from 'constructs';
import { App, Stack} from 'aws-cdk-lib';  
              // core constructs
import { aws_cognito as cognito, aws_iam as iam} from 'aws-cdk-lib';               // stable module
import * as codestar from '@aws-cdk/aws-codestar-alpha'; 
import * as sst from "@serverless-stack/resources";
import * as cdk from "aws-cdk-lib";
import CognitoAuthRole from "./CognitoAuthRole"; // experimental moduleimport { Construct } from 'constructs';import { Construct } from 'constructs';




export default class CognitoStack extends sst.Stack {
  constructor(scope, id, props) {
    super(scope, id, props);

    const { bucketArn } = props;

    const app = this.node.root;

    const userPool = new cognito.UserPool(this, "UserPool", {
      selfSignUpEnabled: true, // Allow users to sign up
      autoVerify: { email: true }, // Verify email addresses by sending a verification code
      signInAliases: { email: true }, // Set email as an alias
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      generateSecret: false, // Don't need to generate secret for web app running on browsers
    });

    const identityPool = new cognito.CfnIdentityPool(this, "IdentityPool", {
      allowUnauthenticatedIdentities: false, // Don't allow unathenticated users
      cognitoIdentityProviders: [
        {
          clientId: userPoolClient.userPoolClientId,
          providerName: userPool.userPoolProviderName,
        },
      ],
    });

    const authenticatedRole = new CognitoAuthRole(this, "CognitoAuthRole", {
      identityPool,
    });

    authenticatedRole.role.addToPolicy(
      // IAM policy granting users permission to a specific folder in the S3 bucket
      new iam.PolicyStatement({
        actions: ["s3:*"],
        effect: iam.Effect.ALLOW,
        resources: [
          bucketArn + "/private/${cognito-identity.amazonaws.com:sub}/*",
        ],
      })
    );

    // Export values
    new cdk.CfnOutput(this, "UserPoolId", {
      value: userPool.userPoolId,
    });
    new cdk.CfnOutput(this, "UserPoolClientId", {
      value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(this, "IdentityPoolId", {
      value: identityPool.ref,
    });
    new cdk.CfnOutput(this, "AuthenticatedRoleName", {
      value: authenticatedRole.role.roleName,
      exportName: app.logicalPrefixedName("CognitoAuthRole"),
    });
  }
}
