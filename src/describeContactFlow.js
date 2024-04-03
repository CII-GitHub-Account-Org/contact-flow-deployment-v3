import AWS from 'aws-sdk';
import { config } from 'dotenv';
config();

const INSTANCEARN = 'arn:aws:connect:us-east-1:750344256621:instance/4bbee21d-72b8-442b-af39-dce4128ca77e';
const TRAGETINSTANCEARN = 'arn:aws:connect:us-east-1:750344256621:instance/561af6e6-7907-4131-9f18-71b466e8763e';
const PRIMARYCFS = await listContactFlows(INSTANCEARN);
const TARGETCFS = await listContactFlows(TRAGETINSTANCEARN);
let isExist;
let TARGETJSON ='';
let TARGETFLOWID = '';

async function listContactFlows(instanceId) {
    const params = {
        InstanceId: instanceId
    };

    try {
        const response = await connect.listContactFlows(params).promise();
        return response;
    } catch (error) {
        console.error(error);
    }
}


async function describeContactFlow(instanceId, flowId, region) {

    console.log('Primary Contact Flows:', primaryContactFlows);
    console.log('Target Contact Flows:', targetContactFlows);

    AWS.config.update({ region });
    const connect = new AWS.Connect();
    const params = {
        InstanceId: instanceId,
        ContactFlowId: flowId
    };
    let data = await connect.describeContactFlow(params).promise();
    console.log(data);
    const flow = JSON.parse(data)
    const content = JSON.parse(flow.ContactFlow.Content)
    TARGETJSON = flow.ContactFlow.Content;
    let flowId = getFlowId(PRIMARYCFS, flow.ContactFlow.Arn, TARGETCFS);
    if (flowId) {
        let flowarn = flowId.split('/');
        TARGETFLOWID = flowarn[3];
        isExist = true;
        console.log(`Need to update flowId : ${TARGETFLOWID}`);
    } else {
        isExist = false;
    }
}

describeContactFlow(INSTANCEARN, 'a222d77e-f37a-42f6-b00e-9a3a1671e9bc', 'us-east-1');

function getFlowId(primary, flowId, target) {
    const pl = JSON.parse(primary);
    const tl = JSON.parse(target);
    let fName = "";
    let rId = "";

    console.log(`Searching for flowId : ${flowId}`);
    for(let i = 0; i < pl.ContactFlowSummaryList.length; i++){
        const obj = pl.ContactFlowSummaryList[i];
        if (obj.Arn === flowId) {
            fName = obj.Name;
            console.log(`Found flow name : ${fName}`);
            break;
        }
    }

    console.log(`Searching for flow name : ${fName}`);
    for(let i = 0; i < tl.ContactFlowSummaryList.length; i++){
        const obj = tl.ContactFlowSummaryList[i];
        if (obj.Name === fName) {
            rId = obj.Arn;
            console.log(`Found flow id : ${rId}`);
            return rId;
        } else if(i === tl.ContactFlowSummaryList.length - 1){
            console.log("create contact flow");
        }
    }
}