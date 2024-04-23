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

// Handling List Contact Flows
const primaryContactFlows = await listResourcesFunc({
  InstanceId: instanceArn,
  ContactFlowTypes: [
    contactFlowType
  ],
   MaxResults: 50
}, retryAttempts, 'ContactFlows');
const targetContactFlows = await listResourcesFunc({
  InstanceId: targetInstanceArn,
  ContactFlowTypes: [
    contactFlowType
  ],
   MaxResults: 50
}, retryAttempts, 'ContactFlows');

// Writing primaryContactFlows and targetContactFlows to files
await writeDataToFile('primaryContactFlows.json', primaryContactFlows);
await writeDataToFile('targetContactFlows.json', targetContactFlows);

// Handling List Queues
const primaryQueues = await listResourcesFunc({
  InstanceId: instanceArn,
  MaxResults: 50
}, retryAttempts, 'Queues');
const targetQueues = await listResourcesFunc({
  InstanceId: targetInstanceArn,
  MaxResults: 50
}, retryAttempts,'Queues');

// Writing primaryQueues and targetQueues to files
await writeDataToFile('primaryQueues.json', primaryQueues);
await writeDataToFile('targetQueues.json', targetQueues);


// Handling List Hours of Operations
const primaryHOP = await listResourcesWithPagination({
  InstanceId: instanceArn,
  MaxResults: 50
}, 'HoursOfOperations');
const targetHOP = await listResourcesWithPagination({
  InstanceId: targetInstanceArn,
  MaxResults: 50
}, 'HoursOfOperations');

// Writing primaryHOP and targetHOP to files
await writeDataToFile('primaryHOP.json', primaryHOP);
await writeDataToFile('targetHOP.json', targetHOP);

// Handling List Lex Bots
const primaryLexBot = await listResourcesWithPagination({
  InstanceId: instanceArn,
  LexVersion: "V2",
  MaxResults: 25
}, 'Bots');
const targetLexBot = await listResourcesWithPagination({
  InstanceId: targetInstanceArn,
  LexVersion: "V2",
  MaxResults: 25
}, 'Bots');

// Writing primaryLexBot and targetLexBot to files
await writeDataToFile('primaryLexBot.json', primaryLexBot);
await writeDataToFile('targetLexBot.json', targetLexBot);

// Handling List Lambda Functions
const primaryLambda = await listResourcesWithPagination({
  InstanceId: instanceArn,
  MaxResults: 25
}, 'LambdaFunctions');
const targetLambda = await listResourcesWithPagination({
  InstanceId: targetInstanceArn,
  MaxResults: 25
}, 'LambdaFunctions');

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
console.log('Data : ',flowData);
const flowContent = flowData.ContactFlow.Content;
targetJson = flowContent;
let contentActions = JSON.parse(targetJson).Actions;
console.log("Content Actions Before Replacing : ", contentActions);
await writeDataToFile('contentActions.json', contentActions);

const missedResourcesInTarget = [];
for (let i = 0; i < contentActions.length; i++) {
    let obj = contentActions[i];
    console.log(`Type value: ${obj.Type}`);

    if (obj.Type === 'ConnectParticipantWithLexBot') {
          console.log('Inside LexBot Handling');
          const lexV2BotAliasArn = obj && obj.Parameters && obj.Parameters.LexV2Bot && obj.Parameters.LexV2Bot.AliasArn ? obj.Parameters.LexV2Bot.AliasArn : undefined;
          console.log('lexV2BotAliasArn : ', lexV2BotAliasArn);
          const targetLexV2BotResources = await lexV2BotHandling(primaryLexBot, lexV2BotAliasArn, targetLexBot, targetRegion);
          console.log('targetLexV2BotResources : ', targetLexV2BotResources);
          if (targetLexV2BotResources && targetLexV2BotResources.ResourceStatus === 'exists') {
            // targetJson = targetJson.replace(new RegExp(LexV2BotAliasArn, 'g'), targetAliasArn);
          } else if (targetLexV2BotResources && targetLexV2BotResources.ResourceStatus === 'notExists') {
            missedResourcesInTarget.push({
              "ResourceType": targetLexV2BotResources.ResourceType,
              "ResourceName": targetLexV2BotResources.ResourceName,
              "ResourceArn": targetLexV2BotResources.ResourceArn
            });
          }
        } else if (obj.Type === 'InvokeLambdaFunction') {
        
          console.log('Inside Lambda Handling', obj);
        
        } else {
          console.log(`No handling for the type : ${obj.Type}`);
        }
}

if (missedResourcesInTarget.length > 0) {
  // Writing missedResourcesInTarget to files
    console.log('missedResourcesInTarget : ', missedResourcesInTarget);
    await writeDataToFile('missedResourcesInTarget.json', missedResourcesInTarget);
    console.log('Note : Please create the missed resources in target instance');
} else {
// contentActions = JSON.parse(targetJson).Actions;
// console.log("contentActions After Replacing", contentActions);
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




// async function getFlowId(flowArn, target, FLOWNAME) {
//   const tl = target;
//   let rId = '';
//   // const pl = primary;

//   console.log(`Searching for flowArn in target: ${flowArn}`);

//   // const primaryObj = pl && pl.ContactFlowSummaryList ? pl.ContactFlowSummaryList.find(obj => obj.Arn === flowId) : undefined;
//   // if (primaryObj) {
//   //   fName = primaryObj.Name;
//   //   console.log(`Found flow name : ${fName}`);
//   // }

//   console.log(`Searching for flow name in target: ${FLOWNAME}`);
//   const targetObj = tl && tl.ContactFlowSummaryList ? tl.ContactFlowSummaryList.find(obj => obj.Name === FLOWNAME) : undefined;
    
//   if (targetObj) {
//     rId = targetObj.Arn;
//     console.log(`Found flow id : ${rId}`);
//     return rId;
//   } else {
//     console.log('Not Found Contact Flow, Please create contact flow');
//     return undefined;
//   }
// }

// function getLambdaId(primary, lambdaId, target) {
//   const pl = primary;
//   const tl = target;
//   const lambda = lambdaId.split(':');
//   let fName = '';
//   let rId = '';

//   console.log(`Searching for LambdaId : ${lambdaId}`);

//   const primaryObj = pl && pl.LambdaFunctions ? pl.LambdaFunctions.find(obj => {
//     const plName = obj.split(':');
//     return plName[6] === lambda[6];
//   }) : undefined;

//   if (primaryObj) {
//     fName = primaryObj.split(':')[6];
//     console.log(`Found lambda name : ${fName}`);
//   }

//   console.log(`Searching for LambdaId name : ${fName}`);

//   const targetObj = tl && tl.LambdaFunctions ? tl.LambdaFunctions.find(obj => {
//     const tlName = obj.split(':');
//     return tlName[6] === fName;
//   }): undefined;

//   if (targetObj) {
//     rId = targetObj.split(':')[6];
//     console.log(`Found lambda id : ${rId}`);
//     return rId;
//   } else {
//     // console.log('create Lambda in targetInstance');
//     console.log('Lambda Not Found Please Create Lambda');
//     return undefined;
//   }
// }

// function getQueueId(primary, queueId, target) {
//   const pl = primary;
//   const tl = target;
//   let fName = '';
//   let rId = '';

//   console.log(`Searching for queueId : ${queueId}`);

//   const primaryObj = pl && pl.QueueSummaryList ? pl.QueueSummaryList.find(obj => obj.Arn === queueId) : undefined;
//   if (primaryObj) {
//     fName = primaryObj.Name;
//     console.log(`Found queue name : ${fName}`);
//   }

//   const targetObj = tl && tl.QueueSummaryList ? tl.QueueSummaryList.find(obj => obj.Name === fName) : undefined;
//   if (targetObj) {
//     rId = targetObj.Arn;
//     console.log(`Found flow id : ${rId}`);
//     return rId;
//   } else {
//     console.log('Queue Not Found Please Create queue');
//     return undefined;
//   }
// }

// function getHOPId(primary, hopId, target) {
//   const pl = primary;
//   const tl = target;
//   let fName = '';
//   let rId = '';

//   console.log(`Searching for hopId : ${hopId}`);

//   for (let i = 0; i < pl.HoursOfOperationSummaryList.length; i++) {
//       const obj = pl.HoursOfOperationSummaryList[i];
//       if (obj.Arn === hopId) {
//           fName = obj.Name;
//           console.log(`Found name : ${fName}`);
//           break;
//       }
//   }

//   console.log(`Searching for hopId for : ${fName}`);

//   for (let i = 0; i < tl.HoursOfOperationSummaryList.length; i++) {
//       const obj = tl.HoursOfOperationSummaryList[i];
//       if (obj.Username === fName) {
//           rId = obj.Arn;
//           console.log(`Found id : ${rId}`);
//           return rId;
//       } else if (i === tl.HoursOfOperationSummaryList.length - 1) {
//           console.log('HOP Not Found Please Create HOP');
//           return undefined;
//       }
//   }
// }


// function getLexBotId(primary, botId, target) {
//     const pl = primary;
//     const tl = target;
//     let fName = '';
//     let rId = '';
  
//     console.log(`Searching for botId : ${botId}`);
  
//     const primaryObj = pl && pl.LexBots ? pl.LexBots.find(obj => obj.Name === botId) : undefined;
//     if (primaryObj) {
//       fName = primaryObj.Name;
//       console.log(`Found bot name : ${fName}`);
//     }
  
//     console.log(`Searching for bot name : ${fName}`);
  
//     const targetObj = tl && tl.LexBots ? tl.LexBots.find(obj => obj.Name === fName) : undefined;
//     if (targetObj) {
//       rId = targetObj.Name;
//       console.log(`Found bot : ${rId}`);
//       return rId;
//     } else {
//       console.log('create bot in targetInstance');
//       console.log('Bot Not Found Please Create Bot');
//       return undefined;
//     }
// }