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

describeContactFlow(process.env.INSTANCEARN, process.env.FLOWID, process.env.Region);