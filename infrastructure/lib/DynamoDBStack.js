import { Construct } from 'constructs';
import { App, Stack} from 'aws-cdk-lib';  
import * as cdk from "aws-cdk-lib";               // core constructs
import { aws_dynamodb as dynamodb } from 'aws-cdk-lib';               // stable module
import * as codestar from '@aws-cdk/aws-codestar-alpha';  // experimental moduleimport { Construct } from 'constructs';import { Construct } from 'constructs';
import * as sst from "@serverless-stack/resources";



export default class DynamoDBStack extends sst.Stack  {
  constructor(scope, id, props) {
    super(scope, id, props);

    const app = this.node.root;

    const table = new dynamodb.Table(this, "Table", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST, // Use on-demand billing mode
      sortKey: { name: "noteId", type: dynamodb.AttributeType.STRING },
      partitionKey: { name: "userId", type: dynamodb.AttributeType.STRING },
    });


    // Output values
    new cdk.CfnOutput(this, "TableName", {
      value: table.tableName,
      exportName: app.logicalPrefixedName("TableName"),
    });
    new cdk.CfnOutput(this, "TableArn", {
      value: table.tableArn,
      exportName: app.logicalPrefixedName("TableArn"),
    });
  }
}
