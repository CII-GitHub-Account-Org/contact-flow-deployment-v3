import AWS from 'aws-sdk';
const connect = new AWS.Connect();

export default async function createOrUpdateFlow(isExist, flowName, targetInstanceArn, contactFlowType, targetJson, targetFlowId, targetRegion) {
    AWS.config.update({
        region: targetRegion, // replace with your region
    });
    console.log('isExist: ',isExist);
    if (!isExist) {
        try {
        console.log("Creating Contact Flow : ", flowName);
        const params = {
            InstanceId: targetInstanceArn,
            Name: flowName,
            Type: contactFlowType,
            Content: targetJson
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
        console.log("Updating Contact Flow : ", flowName);
        const params = {
            InstanceId: targetInstanceArn,
            ContactFlowId: targetFlowId,
            Content: targetJson
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