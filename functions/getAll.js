// const { ScanCommand } = require("@aws-sdk/client-dynamodb");
// const { dynamoDBClient } = require("../utils/awsClient");
// const { unmarshall } = require("@aws-sdk/util-dynamodb"); //use to make javascrpit object format

const { QueryCommand } = require("@aws-sdk/client-dynamodb");
const { dynamoDBClient } = require("../utils/awsClient");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

exports.main = async (event) => {
  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      IndexName: "CreatedAtIndex",  // your GSI name
      KeyConditionExpression: "PK = :pk",
      ExpressionAttributeValues: {
        ":pk": { S: "ITEM" },       // fixed partition key to get all items
      },
      ScanIndexForward: false,       // sort descending by created_at
    };

    const data = await dynamoDBClient.send(new QueryCommand(params));

    const items = data.Items.map((item) => unmarshall(item));

    return {
      statusCode: 200,
      body: JSON.stringify(items || []),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// exports.main = async (event) =>{
//     try {
//         const data = await dynamoDBClient.send(new ScanCommand({
//             TableName: process.env.DYNAMODB_TABLE
//         }));

//         console.log(data)
//         const items = data.Items.map(item => unmarshall(item))

//         return {
//             statusCode : 200,
//             body : JSON.stringify((items || {}))
//         }
//     } catch (err) {
//         return {
//             statusCode : 500,
//             body: JSON.stringify({error : err.message})
//         }
//     }
// }