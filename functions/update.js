const { UpdateItemCommand } = require("@aws-sdk/client-dynamodb");
const { dynamoDBClient, validateApiKey } = require("../utils/awsClient");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

exports.main = async (event) => {
    try {
        await validateApiKey(event.headers);

        const { id } = event.pathParameters || {};
        if (!id) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing required path parameter 'id'" })
            };
        }

        const body = JSON.parse(event.body);
        // if (typeof body.views !== "number") {
        //     return {
        //         statusCode: 400,
        //         body: JSON.stringify({ message: "'views' must be a number" })
        //     };
        // }

        const tableName = process.env.DYNAMODB_TABLE;

        const updateValues = {
            ":title": body.title,
            ":description": body.description,
            ":views": body.views,
            ":updated_at": new Date().toISOString(),
        };

        const params = {
            TableName: tableName,
            Key: marshall({ id }), // Let marshall handle types
            UpdateExpression: "SET title = :title, description = :description, #v = :views, updated_at = :updated_at",
            ExpressionAttributeNames: {
                "#v": "views"
            },
            ExpressionAttributeValues: marshall(updateValues),
            ReturnValues: "ALL_NEW"
        };

        const result = await dynamoDBClient.send(new UpdateItemCommand(params));
        const item = unmarshall(result.Attributes);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Item updated", data: item }),
        };
    } catch (err) {
        console.error("Update error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error updating item",
                error: err.message,
                stack: err.stack,
                name: err.name
            }),
        };
    }
};
