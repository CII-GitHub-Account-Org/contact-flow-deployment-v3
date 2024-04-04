import AWS from 'aws-sdk';
const connect = new AWS.Connect();
import { config } from 'dotenv';
config();

const INSTANCEARN = 'arn:aws:connect:us-east-1:750344256621:instance/4bbee21d-72b8-442b-af39-dce4128ca77e';
const TRAGETINSTANCEARN = 'arn:aws:connect:us-east-1:750344256621:instance/561af6e6-7907-4131-9f18-71b466e8763e';
const PRIMARYCFS = await listContactFlows(INSTANCEARN);
const TARGETCFS = await listContactFlows(TRAGETINSTANCEARN);
// console.log('Primary Contact Flows:', PRIMARYCFS);
// console.log('Target Contact Flows:', TARGETCFS);
let isExist;
let TARGETJSON ='';
let TARGETFLOWID = '';
let PRIMARYPROMPTS = '';
let TARGETPROMPTS = '';

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


const listPromptsParams1 = {
  InstanceId: INSTANCEARN // replace with your instance id
};

await connect.listPrompts(listPromptsParams1, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else    { 
          console.log('PRIMARYPROMPTS', data)
          PRIMARYPROMPTS = data;
          };            // successful response
});

const listPromptsParams2 = {
  InstanceId: TRAGETINSTANCEARN // replace with your target instance id
};

await connect.listPrompts(listPromptsParams2, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else    { 
          console.log('TARGETPROMPTS', data)
          TARGETPROMPTS = data;
          };            // successful response
});

async function describeContactFlow(instanceId, flowId, region) {
    AWS.config.update({ region });
    const params = {
        InstanceId: instanceId,
        ContactFlowId: flowId
    };
    let data = await connect.describeContactFlow(params).promise();
    return data;
}

const data = await describeContactFlow(INSTANCEARN, 'a222d77e-f37a-42f6-b00e-9a3a1671e9bc', 'us-east-1');
console.log('Data:',data);
const flow = data;
const content = flow.ContactFlow.Content;
TARGETJSON = content;
checkFlowArn(PRIMARYCFS, flow.ContactFlow.Arn, TARGETCFS);
const flowArn = flow.ContactFlow.Arn;
console.log('flowArn: ', flowArn)
if (flowArn) {
    let flowArnSplit = flowArn.split('/');
    TARGETFLOWID = flowArnSplit[3];
    isExist = true;
    console.log(`Need to update flowId : ${TARGETFLOWID}`);
} else {
    isExist = false;
}

async function checkFlowArn(primary, flowArn, target) {
    // const pl = JSON.parse(primary);
    // const tl = JSON.parse(target);
    // let fName = "";
    // let rId = "";

    // console.log(`Searching for flowArn : ${flowArn}`);
    // for(let i = 0; i < pl.ContactFlowSummaryList.length; i++){
    //     const obj = pl.ContactFlowSummaryList[i];
    //     if (obj.Arn === flowArn) {
    //         fName = obj.Name;
    //         console.log(`Found flow name : ${fName}`);
    //         break;
    //     }
    // }

    // console.log(`Searching for flow name : ${fName}`);
    // for(let i = 0; i < tl.ContactFlowSummaryList.length; i++){
    //     const obj = tl.ContactFlowSummaryList[i];
    //     if (obj.Name === fName) {
    //         rId = obj.Arn;
    //         console.log(`Found flow id : ${rId}`);
    //         return rId;
    //     } else if(i === tl.ContactFlowSummaryList.length - 1){
    //         console.log("create contact flow");
    //     }
    // }
    return flowArn;
}
