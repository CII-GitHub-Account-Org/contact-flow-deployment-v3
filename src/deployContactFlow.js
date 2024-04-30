import AWS from 'aws-sdk';
let connect = new AWS.Connect();
const instanceArn = process.env.SOURCE_INSTANCEARN;
const targetInstanceArn = process.env.TRAGET_INSTANCEARN;
const flowName = process.env.FLOWNAME;
const contactFlowType = process.env.CONTACTFLOWTYPE;
const sourceRegion = process.env.DEV_REGION;
const targetRegion = process.env.QA_REGION;
const retryAttempts = process.env.RETRY_ATTEMPTS;
console.log('instanceArn', instanceArn);
console.log('targetInstanceArn', targetInstanceArn);
console.log('flowName', flowName);
console.log('contactFlowType', contactFlowType);
console.log('sourceRegion', sourceRegion);
console.log('targetRegion', targetRegion);
console.log('retryAttempts', retryAttempts);
let isExist; // To check if the flow exists in target instance
let targetJson; // To store the target contact flow json
import { listResourcesFunc } from './listResources.js'; 
import  writeDataToFile  from './writeDataToFile.js';
import createOrUpdateFlow from './createOrUpdateFlow.js';
import getContactFlowArn from './getContactFlowArn.js';
import getMissedResources from './getMissedResources.js';
import subContactFlowHandling from './subContactFlowHandling.js';

// // Handling List Contact Flows
// const primaryContactFlows = await listResourcesFunc({
//   InstanceId: instanceArn,
//   ContactFlowTypes: [
//     contactFlowType
//   ],
//   MaxResults: 50,
// }, retryAttempts, 'ContactFlows', sourceRegion);
// const targetContactFlows = await listResourcesFunc({
//   InstanceId: targetInstanceArn,
//   ContactFlowTypes: [
//     contactFlowType
//   ],
//    MaxResults: 50
// }, retryAttempts, 'ContactFlows', targetRegion);


// Handling List Contact Flows
const primaryContactFlows = await listResourcesFunc({
  InstanceId: instanceArn,
  MaxResults: 50,
}, retryAttempts, 'ContactFlows', sourceRegion);
const targetContactFlows = await listResourcesFunc({
  InstanceId: targetInstanceArn,
   MaxResults: 50
}, retryAttempts, 'ContactFlows', targetRegion);

// Writing primaryContactFlows and targetContactFlows to files
await writeDataToFile('primaryContactFlows.json', primaryContactFlows);
await writeDataToFile('targetContactFlows.json', targetContactFlows);

// Handling List Queues
const primaryQueues = await listResourcesFunc({
  InstanceId: instanceArn,
  MaxResults: 50
}, retryAttempts, 'Queues', sourceRegion);
const targetQueues = await listResourcesFunc({
  InstanceId: targetInstanceArn,
  MaxResults: 50
}, retryAttempts,'Queues', targetRegion);

// Writing primaryQueues and targetQueues to files
await writeDataToFile('primaryQueues.json', primaryQueues);
await writeDataToFile('targetQueues.json', targetQueues);

// Handling List Hours of Operations
const primaryHOP = await listResourcesFunc({
  InstanceId: instanceArn,
  MaxResults: 50
}, retryAttempts, 'HoursOfOperations', sourceRegion);
const targetHOP = await listResourcesFunc({
  InstanceId: targetInstanceArn,
  MaxResults: 50
}, retryAttempts, 'HoursOfOperations', targetRegion);

// Writing primaryHOP and targetHOP to files
await writeDataToFile('primaryHOP.json', primaryHOP);
await writeDataToFile('targetHOP.json', targetHOP);

// Handling List Lex Bots
const primaryLexBot = await listResourcesFunc({
  InstanceId: instanceArn,
  LexVersion: "V2",
  MaxResults: 25
}, retryAttempts, 'Bots', sourceRegion);
const targetLexBot = await listResourcesFunc({
  InstanceId: targetInstanceArn,
  LexVersion: "V2",
  MaxResults: 25
}, retryAttempts, 'Bots', targetRegion);

// Writing primaryLexBot and targetLexBot to files
await writeDataToFile('primaryLexBot.json', primaryLexBot);
await writeDataToFile('targetLexBot.json', targetLexBot);

// Handling List Lambda Functions
const primaryLambda = await listResourcesFunc({
  InstanceId: instanceArn,
  MaxResults: 25
},retryAttempts, 'LambdaFunctions', sourceRegion);
const targetLambda = await listResourcesFunc({
  InstanceId: targetInstanceArn,
  MaxResults: 25
},retryAttempts, 'LambdaFunctions', targetRegion);

// Writing primaryLambda and targetLambda to files
await writeDataToFile('primaryLambda.json', primaryLambda);
await writeDataToFile('targetLambda.json', targetLambda);
    // get primary flow Arn
    const primaryFlowArn = await getContactFlowArn(primaryContactFlows, flowName);
    console.log('primaryFlowArn', primaryFlowArn);
    if (!primaryFlowArn){
    console.log('Primary Flow Not Found, Please check the flow name and try again.');
    } else {

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
const flowData = await describeContactFlow(instanceArn, primaryFlowId, sourceRegion);
// console.log('Data : ',flowData);
const flowContent = flowData.ContactFlow.Content;
targetJson = flowContent;
let contentActions = JSON.parse(targetJson).Actions;
// console.log("Content Actions Before Replacing : ", contentActions);
await writeDataToFile('contentActions.json', contentActions);
await writeDataToFile('targetJson.json', JSON.parse(targetJson));
let missedResourcesInTarget = [];
const responseResources = await getMissedResources(targetJson, contentActions, flowName, primaryQueues, targetQueues, 
  primaryHOP, targetHOP, primaryLexBot, targetLexBot, primaryLambda, targetLambda, sourceRegion, targetRegion);
targetJson = responseResources.targetJson
missedResourcesInTarget = missedResourcesInTarget.concat(responseResources.missedResourcesInTarget);
let priority = 1;
let arrayToCreateOrUpdateFlow = [
  { "isExist": isExist, 
    "flowName": flowName, 
    "targetInstanceArn": targetInstanceArn, 
    "contactFlowType": contactFlowType, 
    "targetJson": targetJson, 
    "targetFlowId": targetFlowId, 
    "targetRegion": targetRegion,
    "priority": priority
  }
];
await writeDataToFile('missedResourcesInTarget.json', missedResourcesInTarget);
await writeDataToFile('arrayToCreateOrUpdateFlow.json', arrayToCreateOrUpdateFlow);

for (let i = 0; i < contentActions.length; i++) {
    let obj = contentActions[i];
    console.log(`Type value: ${obj.Type}`);
        if (obj.Type === 'UpdateContactEventHooks') {
          console.log('Inside Event Hooks Handling');
          if (obj.Parameters.EventHooks.AgentWhisper) {
            console.log('Inside Agent Whisper Handling');
            console.log('obj : ', obj);
            // let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.AgentWhisper, TARGETCFS);
            // if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.AgentWhisper, 'g'), arn)};
          } 
        else if (obj.Parameters.EventHooks.CustomerQueue) {
          console.log('Inside Customer Queue Handling');
          console.log('obj : ', obj);
          // obj :  {
          //   Parameters: {
          //     EventHooks: {
          //       CustomerQueue: 'arn:aws:connect:us-east-1:***:instance/4bbee21d-72b8-442b-af39-dce4128ca77e/contact-flow/4aaf1c69-6bf9-4312-9db8-c1b585cc2664'
          //     }
          //   },
          //   Identifier: '4d3295c8-7f19-4646-9bb0-1fbb25802a5c',
          //   Type: 'UpdateContactEventHooks',
          //   Transitions: {
          //     NextAction: '2687fd55-d81d-4372-8b6b-0a4bafa0bd08',
          //     Errors: [ [Object] ]
          //   }
          // }
        
          const subCustomerQueueFlowArn = obj && obj.Parameters && obj.Parameters.EventHooks && obj.Parameters.EventHooks.CustomerQueue ? obj.Parameters.EventHooks.CustomerQueue : undefined;
          console.log('subCustomerQueueFlowArn : ', subCustomerQueueFlowArn);
          const subContactFlowHandlingRes = await subContactFlowHandling(primaryContactFlows, subCustomerQueueFlowArn, targetContactFlows, instanceArn, sourceRegion, targetRegion);
          console.log('subContactFlowHandlingRes : ', subContactFlowHandlingRes);
          await writeDataToFile('subContactFlowHandlingRes.json', subContactFlowHandlingRes);
          // if (targetQueueResources && targetQueueResources.ResourceStatus === 'exists') {
          //   targetJson = targetJson.replace(new RegExp(queueArn, 'g'), targetQueueResources.ResourceArn);
          // } else if (targetQueueResources && targetQueueResources.ResourceStatus === 'notExists') {
          //   missedResourcesInTarget.push({
          //       "flowName": flowName,
          //       "ResourceType": targetQueueResources.ResourceType,
          //       "ResourceName": targetQueueResources.ResourceName,
          //       "ResourceArn": targetQueueResources.ResourceArn
          //   });
          // }
            // let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.CustomerQueue, TARGETCFS);
            // if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.CustomerQueue, 'g'), arn)};
          } 
        else if (obj.Parameters.EventHooks.CustomerRemaining) {
          console.log('Inside Customer Remaining Handling');
          console.log('obj : ', obj);
            // let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.CustomerRemaining, TARGETCFS);
            // if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.CustomerRemaining, 'g'), arn)};
          }
        
        } else if (obj.Type === 'TransferToFlow') {
          console.log('Inside Transfer To Flow Handling');
          console.log('obj : ', obj);
          // let arn = getFlowId(PRIMARYCFS, obj.Parameters.ContactFlowId, TARGETCFS);
          // if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.ContactFlowId, 'g'), arn)};
        } else {
          console.log(`No handling for the type : ${obj.Type}`);
        }
}


await writeDataToFile('targetJsonUpdated.json', JSON.parse(targetJson));
contentActions = JSON.parse(targetJson).Actions;
// console.log("contentActions After Replacing", contentActions);
await writeDataToFile('contentActionsUpdated.json', contentActions);
if (missedResourcesInTarget.length > 0) {
  // Writing missedResourcesInTarget to files
    console.log('missedResourcesInTarget : ', missedResourcesInTarget);
    await writeDataToFile('missedResourcesInTarget.json', missedResourcesInTarget);
    console.log('Note : Please create the missed resources in target instance');
} 
// else {
//   console.log('No missed resources in target instance');
//   await createOrUpdateFlow(isExist, flowName, targetInstanceArn, contactFlowType, targetJson, targetFlowId, targetRegion)
// }
}