const { PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { dynamoDBClient, validateApiKey } = require("../utils/awsClient");
const { v4: uuidv4 } = require("uuid");
const { marshall } = require("@aws-sdk/util-dynamodb");

exports.main = async (event) => {
  try {
    await validateApiKey(event.headers);

    const body = JSON.parse(event.body);

    // Validate that body.description is an array of objects
    if (!Array.isArray(body.description) || !body.description.every(d => typeof d === 'object')) {
      throw new Error("Invalid format for description");
    }

    const item = {
      id: uuidv4(),
      PK: "ITEM",
      title: String(body.title || ""),
      description: body.description, // Array of objects is fine
      views: Number(body.views) || 0,
      created_by: String(body.created_by || ""),
      created_at: new Date().toISOString()
    };

    await dynamoDBClient.send(new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: marshall(item)
    }));

    return {
      statusCode: 201,
      body: JSON.stringify({ message: "Item created", data: item })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
