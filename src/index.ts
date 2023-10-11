import * as AWS from 'aws-sdk';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const dynamo = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });
const TableName = "todo-list";

export const handler = async (event: APIGatewayEvent, context: Context): Promise<APIGatewayProxyResult> => {

    let body: any;
    let statusCode = 200;

    const headers = {
        "Content-Type": "application/json"
    }

    try {
        switch (event.httpMethod) { 
            case "DELETE":
                await dynamo.delete({
                    TableName,
                    Key: { id: event.pathParameters!.id  }
                }).promise();

                body = `Deleted item ${event.pathParameters?.id}`;
                break;
            
            case "GET ":
                if (event.pathParameters) {
                    body = await dynamo.get({
                        TableName,
                        Key: { id: event.pathParameters!.id }
                    }).promise();
                }
                else {
                    body = await dynamo.scan({ TableName }).promise();
                }
                break;
            
            case "PUT":
                let requestJSON = JSON.parse(event.body||'');
                await dynamo.put({
                    TableName,
                    Item: {
                        id: requestJSON.id,
                        description: requestJSON.description,
                        done: requestJSON.done
                    }
                }).promise();

                body = `Put item ${requestJSON.id}`;
                break;
            default:
                throw new Error(`Unsupported route: "${event.httpMethod}/${event.pathParameters}"`);
                break;
        }
    } catch (error: any) {
        statusCode = 400;
        body = error.message;
    } finally {
        body = JSON.stringify(body);
    }

    return { statusCode, body, headers };
}


// exports.handler = async (event) => {
//     const response = {
//         statusCode: 200,
//         body: JSON.stringify('Go Serverless v1.0! Your function executed successfully!'),
//     }
//     return response;
// }