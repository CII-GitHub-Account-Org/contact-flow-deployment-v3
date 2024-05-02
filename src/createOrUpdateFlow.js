import AWS from 'aws-sdk';
const connect = new AWS.Connect();
import  writeDataToFile  from './writeDataToFile.js';
let replaceArnArray = [];

export default async function createOrUpdateFlow(arrayToCreateOrUpdateFlow) {

    //Sort the array based on Priority with descending order
    arrayToCreateOrUpdateFlow.sort((a, b) => b.priority - a.priority);

    // // Process only the first item of the array
    // await handleCreateOrUpdateFlow(arrayToCreateOrUpdateFlow[0]);

    // Iterate over the array and call createOrUpdateFlow for each item
    for (const flow of arrayToCreateOrUpdateFlow) {
        await handleCreateOrUpdateFlow(flow);
  }
}

async function handleCreateOrUpdateFlow(flow) {
    AWS.config.update({
        region: flow.targetRegion, // replace with your region
    });
    console.log('isExist: ',flow.isExist);
    if (!flow.isExist) {
        try {
        console.log("Creating Contact Flow : ", flow.flowName);
        for (const item of replaceArnArray) {
            if (flow.targetJson.includes(item.sourceFlowArn)){
            flow.targetJson = flow.targetJson.replace(new RegExp(item.sourceFlowArn, 'g'), item.targetFlowArn);
            }
        }
        if (flow.flowName === 'copilot-test-contact-flow-2'){
            await writeDataToFile('replaceArnArray.json', replaceArnArray);
            await writeDataToFile('copilot-test-contact-flow-2.json', flow.targetJson);
        }
        const params = {
            InstanceId: flow.targetInstanceArn,
            Name: flow.flowName,
            Type: flow.contactFlowType,
            Content: flow.targetJson
        };
        console.log("params: ", params);
        try {
            const data = await connect.createContactFlow(params).promise();
            console.log(data);
            //  data will be like below{
            //     ContactFlowId: '070c0a0b-cb0d-4de1-aa6b-3701844663f6',
            //     ContactFlowArn: 'arn:aws:connect:us-east-1:***:instance/561af6e6-7907-4131-9f18-71b466e8763e/contact-flow/070c0a0b-cb0d-4de1-aa6b-3701844663f6'
            //   }
            console.log('NEW FLOW HAS BEEN CREATED');
            replaceArnArray.push ({
                "flowName": flow.flowName,
                "sourceFlowArn": flow.flowArn,
                "targetFlowArn": data.ContactFlowArn
            });
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
        console.error(`Error: ${error.code}`);
        console.error(`Message: ${error.message}`);
        console.error(`Request ID: ${error.requestId}`);
        console.error(`Status Code: ${error.statusCode}`);
        console.error(`Retryable: ${error.retryable}`);
        console.error(`Retry Delay: ${error.retryDelay}`);
      }
    } else {
        console.log("Updating Contact Flow : ", flow.flowName);
        for (const item of replaceArnArray) {
            if (flow.targetJson.includes(item.sourceFlowArn)){
            flow.targetJson = flow.targetJson.replace(new RegExp(item.sourceFlowArn, 'g'), item.targetFlowArn);
            }
        }
        const params = {
            InstanceId: flow.targetInstanceArn,
            ContactFlowId: flow.targetFlowId,
            Content: flow.targetJson
        };
        console.log("params: ", params);
        try {
            const data = await connect.updateContactFlowContent(params).promise();
            console.log(data);
            console.log('FLOW HAS BEEN UPDATED');
        } catch (error) {
            console.error(error);
        }
    }
}