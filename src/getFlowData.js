import getContactFlowArn from './getContactFlowArn.js';


export default async function getFlowData(primaryFlowArn, targetContactFlows, instanceArn, flowName, sourceRegion, targetRegion, isExist) {
    // get primary flow Id
    const primaryFlowId = primaryFlowArn.split('/')[3];
    console.log('primaryFlowId', primaryFlowId);

    // get target flow Arn
    let targetFlowId;
    const targetFlowArn = await getContactFlowArn(targetContactFlows, flowName);
    if (!targetFlowArn){
    console.log('Target flow not found, Need to create contact flow.');
    isExist = false;
    } else { 
    isExist = true;
    // get target flow Id
    console.log('targetFlowArn', targetFlowArn);
    targetFlowId = targetFlowArn.split('/')[3];
    console.log('targetFlowId : ', targetFlowId);
    console.log(`Target flow found, Updating contact flow : ${flowName}`);
    }

    const flowData = await describeContactFlow(instanceArn, primaryFlowId, sourceRegion);
    // console.log('Data : ',flowData);

    return flowData;

    }

    // describe contact flow and get content
    async function describeContactFlow(instanceId, primaryFlowId, sourceRegion) {
        AWS.config.update({ sourceRegion });
        connect = new AWS.Connect();
        const params = {
            InstanceId: instanceId,
            ContactFlowId: primaryFlowId
        };
        let data = await connect.describeContactFlow(params).promise();
        return data;
        }