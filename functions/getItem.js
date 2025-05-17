const { GetItemCommand } =  require("@aws-sdk/client-dynamodb")
const { dynamoDBClient, validateApiKey } = require("../utils/awsClient");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

exports.main = async (event) => {
    try {
        await validateApiKey(event.headers)
        const { id } = event.pathParameters;
        
        const data = await dynamoDBClient.send(new GetItemCommand({
            TableName : process.env.DYNAMODB_TABLE,
            Key : {id : { S : id}}
        }));
        // console.log(data,'id')
        if(!data.Item){
            return {
                statusCode : 404,
                body: JSON.stringify({message : "Item not found"})
            };
        }

        const item = unmarshall(data.Item)
        return {
            statusCode : 200,
            body : JSON.stringify(item || {})
        }
    } catch (err) {
        return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
}