import AWS from 'aws-sdk';
import { config } from 'dotenv';
config();

async function describeContactFlow(instanceId, flowId, region) {
    AWS.config.update({ region });
    const connect = new AWS.Connect();
    const params = {
        InstanceId: instanceId,
        ContactFlowId: flowId
    };
    let data = await connect.describeContactFlow(params).promise();
    console.log(data);
    // Remove unused variables
    // let content = JSON.parse(data.ContactFlow.Content);
    // let targetJson = data.ContactFlow.Content;
    // Continue with the rest of your logic...
}

describeContactFlow('arn:aws:connect:us-east-1:750344256621:instance/4bbee21d-72b8-442b-af39-dce4128ca77e', 'a222d77e-f37a-42f6-b00e-9a3a1671e9bc', 'us-east-1');