import AWS from 'aws-sdk';
const connect = new AWS.Connect();

export default async function createOrUpdateFlow(arrayToCreateOrUpdateFlow) {

    //Sort the array based on Priority with descending order
    arrayToCreateOrUpdateFlow.sort((a, b) => b.Priority - a.Priority);

    // Process only the last item of the array
    await handleCreateOrUpdateFlow(arrayToCreateOrUpdateFlow[0]);

//     // Iterate over the array and call createOrUpdateFlow for each item
//     for (const flow of arrayToCreateOrUpdateFlow) {
//         await handleCreateOrUpdateFlow(flow);
//   }
}

async function handleCreateOrUpdateFlow(flow) {
    AWS.config.update({
        region: flow.targetRegion, // replace with your region
    });
    console.log('isExist: ',flow.isExist);
    if (!flow.isExist) {
        try {
        console.log("Creating Contact Flow : ", flow.flowName);
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
            console.log('NEW FLOW HAS BEEN CREATED');
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