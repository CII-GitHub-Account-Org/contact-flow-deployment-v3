import AWS from 'aws-sdk';
let connect = new AWS.Connect();

export default async function subContactFlowHandling(primaryContactFlows, subContactFlowArn, targetContactFlows, instanceArn, sourceRegion, targetRegion) {  

let primarySubContactFlowName;
let primarySubContactFlowType;
let primarySubContactFlowId;

if (!Array.isArray(primaryContactFlows) || primaryContactFlows.length === 0) {
    console.log('primaryContactFlows is empty or not an array');
    return undefined;
  }

  let foundSubContactFlowInPrimary = false;
  for (let item of primaryContactFlows) {
      if (item && item.ContactFlowSummaryList){
          for (let subItem of item.ContactFlowSummaryList) {
              if (subItem.Arn === subContactFlowArn) {
                  primarySubContactFlowName = subItem.Name;
                  primarySubContactFlowType = subItem.ContactFlowType;
                  primarySubContactFlowId = subItem.Id;
                  foundSubContactFlowInPrimary = true;
                  break;
              }
          }
      }
      if (foundSubContactFlowInPrimary) {
          break;
      }
  }

if (!foundSubContactFlowInPrimary) {
  console.log('Not Found subContactFlowArn in primaryContactFlows');
  return undefined;
}


let foundSubContactFlowInTarget = false;
let targetSubContactFlowArn;
let targetSubContactFlowId;
if (Array.isArray(targetContactFlows) || targetContactFlows.length > 0) {

  for (let item of targetContactFlows) {
      if (item && item.ContactFlowSummaryList){
          for (let subItem of item.ContactFlowSummaryList) {
            const targetSubContactFlowName = subItem.Name;
              if (targetSubContactFlowName === primarySubContactFlowName) {
                console.log('Found subContactFlowArn in targetContactFlows');
                  targetSubContactFlowArn = subItem.Arn;
                  targetSubContactFlowId = subItem.Id;
                  foundSubContactFlowInTarget = true;
                  break;
              }
          }
      }
      if (foundSubContactFlowInTarget) {
          break;
      }
  }

}

const flowData = await describeContactFlow(instanceArn, primarySubContactFlowId, sourceRegion);
const flowContent = flowData.ContactFlow.Content;
const targetJsonSubContactFlow = flowContent;
let contentActionsSubContactFlow = JSON.parse(targetJsonSubContactFlow).Actions;
  return {
    "isExists": foundSubContactFlowInTarget,
    "primarySubContactFlowName": primarySubContactFlowName,
    "primarySubContactFlowType": primarySubContactFlowType,
    "primarySubContactFlowId": primarySubContactFlowId,
    "primarySubContactFlowArn": subContactFlowArn,
    "targetSubContactFlowId": targetSubContactFlowId,
    "targetJsonSubContactFlow": targetJsonSubContactFlow,
    "contentActionsSubContactFlow": contentActionsSubContactFlow
  };

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