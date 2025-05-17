const { ScanCommand } = require("@aws-sdk/client-dynamodb");
const { dynamoDBClient, validateApiKey } = require("../utils/awsClient");
const { unmarshall } = require("@aws-sdk/util-dynamodb"); //use to make javascrpit object format

exports.main = async (event) =>{
    try {
        // await validateApiKey(event.headers);

        const { keyword } = event.pathParameters;

        const lowercaseKeyword = keyword.toLowerCase();

        let params = {
            TableName: process.env.DYNAMODB_TABLE,
        }

        const data = await dynamoDBClient.send(new ScanCommand(params));
        
        // Case-insensitive filter in JavaScript
        const items = data.Items
            .map(item => unmarshall(item))
            .filter(item => {
                const titleMatch = item.title?.toLowerCase().includes(lowercaseKeyword);

                const descriptionMatch =
                    Array.isArray(item.description) &&
                    item.description.some(descObj =>
                        Object.values(descObj).some(val =>
                            typeof val === 'string' &&
                            val.toLowerCase().includes(lowercaseKeyword)
                        )
                    );

                return titleMatch || descriptionMatch;
            });

        if (items.length === 0) {
            return {
              statusCode: 404,
              body: JSON.stringify({ message: "No items found" }),
            };
        }
        return {
            statusCode: 200,
            body: JSON.stringify(items || {})
          };

    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: err.message }),
          };
    }
}