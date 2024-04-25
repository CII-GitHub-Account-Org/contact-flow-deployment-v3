import AWS from 'aws-sdk';
const connect = new AWS.Connect();
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
let isExist;
let targetJson;
import { listResourcesWithPagination, listResourcesFunc } from './listResources.js';
import  writeDataToFile  from './writeDataToFile.js';
import getContactFlowArn from './getContactFlowArn.js';
import createOrUpdateFlow from './createOrUpdateFlow.js';
import lexV2BotHandling from './lexV2BotHandling.js';
import lambdaHandling from './lambdaHandling.js';
import queueHandling from './queueHandling.js';

// Handling List Contact Flows
const primaryContactFlows = await listResourcesFunc({
  InstanceId: instanceArn,
  ContactFlowTypes: [
    contactFlowType
  ],
   MaxResults: 50
}, retryAttempts, 'ContactFlows', sourceRegion);
const targetContactFlows = await listResourcesFunc({
  InstanceId: targetInstanceArn,
  ContactFlowTypes: [
    contactFlowType
  ],
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
const targetFlowArn = await getContactFlowArn(targetContactFlows, flowName);
console.log('targetFlowArn', targetFlowArn);
if (!targetFlowArn){
  console.log('Target flow not found, Creating contact flow.');
  isExist = false;
} else { 
  isExist = true;
  console.log(`Target flow found, Updating contact flow : ${flowName}`);
 }

// get target flow Id
const targetFlowId = targetFlowArn.split('/')[3];
console.log('targetFlowId : ', targetFlowId);

// describe contact flow and get content
async function describeContactFlow(instanceId, primaryFlowId, sourceRegion) {
  AWS.config.update({ sourceRegion });
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
const missedResourcesInTarget = [];
for (let i = 0; i < contentActions.length; i++) {
    let obj = contentActions[i];
    console.log(`Type value: ${obj.Type}`);
        if (obj.Type === 'UpdateContactTargetQueue') {
          console.log('Inside Queue Handling');
          console.log('obj : ', obj);
          const queueArn = obj && obj.Parameters && obj.Parameters.QueueId ? obj.Parameters.QueueId : undefined;
          console.log('queueArn : ', queueArn);
          const targetQueueResources = await queueHandling(primaryQueues, queueArn, targetQueues);
          console.log('targetQueueResources : ', targetQueueResources);
          if (targetQueueResources && targetQueueResources.ResourceStatus === 'exists') {
            targetJson = targetJson.replace(new RegExp(queueArn, 'g'), targetQueueResources.ResourceArn);
          } else if (targetQueueResources && targetQueueResources.ResourceStatus === 'notExists') {
            missedResourcesInTarget.push({
              "ResourceType": targetQueueResources.ResourceType,
              "ResourceName": targetQueueResources.ResourceName,
              "ResourceArn": targetQueueResources.ResourceArn
            });
          }
        } else if (obj.Type === 'CheckHoursOfOperation') {
          console.log('Inside HOP Handling');
          console.log('obj : ', obj);
          // const hopArn = obj && obj.Parameters && obj.Parameters.HoursOfOperationId ? obj.Parameters.HoursOfOperationId : undefined;
          // console.log('hopArn : ', hopArn);
          // const targetHopResources = await hopHandling(primaryHOP, hopArn, targetHOP);
          // console.log('targetHopResources : ', targetHopResources);
          // if (targetHopResources && targetHopResources.ResourceStatus === 'exists') {
          //   targetJson = targetJson.replace(new RegExp(hopArn, 'g'), targetHopResources.ResourceArn);
          // } else if (targetHopResources && targetHopResources.ResourceStatus === 'notExists') {
          //   missedResourcesInTarget.push({
          //     "ResourceType": targetHopResources.ResourceType,
          //     "ResourceName": targetHopResources.ResourceName,
          //     "ResourceArn": targetHopResources.ResourceArn
          //   });
          // }
        } else if (obj.Type === 'ConnectParticipantWithLexBot') {
          console.log('Inside LexBot Handling');
          const lexV2BotAliasArn = obj && obj.Parameters && obj.Parameters.LexV2Bot && obj.Parameters.LexV2Bot.AliasArn ? obj.Parameters.LexV2Bot.AliasArn : undefined;
          console.log('lexV2BotAliasArn : ', lexV2BotAliasArn);
          const targetLexV2BotResources = await lexV2BotHandling(primaryLexBot, lexV2BotAliasArn, targetLexBot, sourceRegion, targetRegion);
          console.log('targetLexV2BotResources : ', targetLexV2BotResources);
          if (targetLexV2BotResources && targetLexV2BotResources.ResourceStatus === 'exists') {
              targetJson = targetJson.replace(new RegExp(lexV2BotAliasArn, 'g'), targetLexV2BotResources.ResourceArn);
          } else if (targetLexV2BotResources && targetLexV2BotResources.ResourceStatus === 'notExists') {
            missedResourcesInTarget.push({
              "ResourceType": targetLexV2BotResources.ResourceType,
              "ResourceName": targetLexV2BotResources.ResourceName,
              "ResourceArn": targetLexV2BotResources.ResourceArn
            });
          }
        } else if (obj.Type === 'InvokeLambdaFunction') {
          console.log('Inside Lambda Handling');
          const lambdaFunctionARN = obj && obj.Parameters && obj.Parameters.LambdaFunctionARN ? obj.Parameters.LambdaFunctionARN : undefined;
          console.log('lambdaFunctionARN : ', lambdaFunctionARN);
          const targetLambdaResources = await lambdaHandling(primaryLambda, lambdaFunctionARN, targetLambda, sourceRegion, targetRegion);
          console.log('targetLambdaResources : ', targetLambdaResources);
          if (targetLambdaResources && targetLambdaResources.ResourceStatus === 'exists') {
              targetJson = targetJson.replace(new RegExp(lambdaFunctionARN, 'g'), targetLambdaResources.ResourceArn);
          } else if (targetLambdaResources && targetLambdaResources.ResourceStatus === 'notExists') {
            missedResourcesInTarget.push({
              "ResourceType": targetLambdaResources.ResourceType,
              "ResourceName": targetLambdaResources.ResourceName,
              "ResourceArn": targetLambdaResources.ResourceArn
            });
          }
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
} else {
// await createOrUpdateFlow(isExist, flowName, targetInstanceArn, contactFlowType, targetJson, targetFlowId)
}
}




// for (let i = 0; i < contentActions.length; i++) {
//   let obj = contentActions[i];
//   console.log(`Type value: ${obj.Type}`);

//   if (obj.Type === 'MessageParticipant') {
//     if (obj.Parameters.PromptId !== null) {
//       console.log('inside prompt');
//       let arn = getPromptId(PRIMARYPROMPTS, obj.Parameters.PromptId, TARGETPROMPTS);
//       if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.PromptId, 'g'), arn)};
//     }
//   } else if (obj.Type === 'ConnectParticipantWithLexBot') {
//     console.log('inside lexbot');
//     console.log('LEXBOT HANLDING YET TO DO');
//     // let arn = getlexbotId(PRIMARYBOT, obj.Parameters.LexBot.Name, TARGETBOT);
//     // handle lex bot
//   } else if (obj.Type === 'UpdateContactTargetQueue') {
//     console.log('inside queue');
//     let arn = getQueueId(PRIMARYQUEUES, obj.Parameters.QueueId, TARGETQUEUES);
//     if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.QueueId, 'g'), arn)};
//   } 
//   else if (obj.Type === 'UpdateContactEventHooks') {
//     if (obj.Parameters.EventHooks.AgentWhisper) {
//       let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.AgentWhisper, TARGETCFS);
//       if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.AgentWhisper, 'g'), arn)};
//     } 
//   else if (obj.Parameters.EventHooks.CustomerQueue) {
//       let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.CustomerQueue, TARGETCFS);
//       if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.CustomerQueue, 'g'), arn)};
//     } 
//   else if (obj.Parameters.EventHooks.CustomerRemaining) {
//       let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.CustomerRemaining, TARGETCFS);
//       if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.CustomerRemaining, 'g'), arn)};
//     }
//   } 
//   else if (obj.Type === 'InvokeLambdaFunction') {
//     let lambdaId = getLambdaId(PRIMARYLAMBDA, obj.Parameters.LambdaFunctionARN, TARGETLAMBDA);
//   } 
//   else if (obj.Type === 'TransferToFlow') {
//     let arn = getFlowId(PRIMARYCFS, obj.Parameters.ContactFlowId, TARGETCFS);
//     if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.ContactFlowId, 'g'), arn)};
//   } 
//   else if (obj.Type === 'CheckHoursOfOperation') {
//     let arn = getHOPId(PRIMARYHOP, obj.Parameters.HoursOfOperationId, TARGETHOP);
//     if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.HoursOfOperationId, 'g'), arn)};
//   } else {
//     console.log(`No handling for ${JSON.stringify(obj.Parameters)} of type : ${obj.Type}`);
//   }
// }