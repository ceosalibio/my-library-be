const { DeleteItemCommand } = require("@aws-sdk/client-dynamodb")
const { dynamoDBClient, validateApiKey } = require("../utils/awsClient");
// const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

exports.main = async (event) => {
    try {
        await validateApiKey(event.headers);
        const { id } = event.pathParameters;

        await dynamoDBClient.send(new DeleteItemCommand({
            TableName: process.env.DYNAMODB_TABLE,
            Key : {id: {S : id} }
        }))

        return {
            statusCode : 200,
            body : JSON.stringify({ message : "Item deleted"})
        }
    } catch (err) {
        return {
            statusCode : 500,
            body : JSON.stringify({ error : err.message})
        }
    }
    
}