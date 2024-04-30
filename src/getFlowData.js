import getContactFlowArn from './getContactFlowArn.js';


export default async function getFlowData(primaryFlowArn, targetContactFlows, instanceArn, flowName, sourceRegion, targetRegion, isExist) {
    // get primary flow Id
    const primaryFlowId = primaryFlowArn.split('/')[3];
    console.log('primaryFlowId', primaryFlowId);

 

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