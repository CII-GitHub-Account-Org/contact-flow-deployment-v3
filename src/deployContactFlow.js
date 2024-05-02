import AWS from 'aws-sdk';
let connect = new AWS.Connect();
const instanceArn = process.env.SOURCE_INSTANCEARN;
const targetInstanceArn = process.env.TRAGET_INSTANCEARN;
const flowName = process.env.FLOWNAME;
const contactFlowType = process.env.CONTACTFLOWTYPE;
const sourceRegion = process.env.DEV_REGION;
const targetRegion = process.env.QA_REGION; // Target region
const retryAttempts = process.env.RETRY_ATTEMPTS; // Number of retry attempts
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
let priority = 0;
let arrayToCreateOrUpdateFlow = [
  { "isExist": isExist, 
    "flowName": flowName, 
    "flowArn": primaryFlowArn,
    "targetInstanceArn": targetInstanceArn, 
    "contactFlowType": contactFlowType, 
    "targetJson": targetJson, 
    "targetFlowId": targetFlowId, 
    "targetRegion": targetRegion,
    "priority": priority++
  }
];

let replaceArnArrayForUpdate = []
let subContactFlowsArray = [];
let count = 0;
async function handleContentActions(contentActions) {
  let queue = [...contentActions];
  while (queue.length > 0) {
    let obj = queue.shift();
    console.log(`Type value: ${obj.Type}`);
    if (obj.Type === 'UpdateContactEventHooks') {
      if (obj.Parameters.EventHooks.AgentWhisper) {
        console.log('obj : ', obj);
         const subAgentWhisperFlowArn = obj && obj.Parameters && obj.Parameters.EventHooks && obj.Parameters.EventHooks.AgentWhisper ? obj.Parameters.EventHooks.AgentWhisper : undefined;
         const subAgentWhisperFlowContenActions = await subContactFlowHandling(primaryContactFlows, subAgentWhisperFlowArn, targetContactFlows, instanceArn, sourceRegion, targetRegion);
         subContactFlowsArray.push({
          "contactFlowArn": subAgentWhisperFlowArn,
          "contactFlowName": subAgentWhisperFlowContenActions.primarySubContactFlowName,
          "contactFlowType": subAgentWhisperFlowContenActions.primarySubContactFlowType,
          "targetJson": subAgentWhisperFlowContenActions.targetJsonSubContactFlow,
          "contentActions": subAgentWhisperFlowContenActions.contentActionsSubContactFlow,
          "isExists": subAgentWhisperFlowContenActions.isExists,
          "targetContactFlowId": subAgentWhisperFlowContenActions.targetSubContactFlowId,
          "priority": count++
         });
         if (subAgentWhisperFlowContenActions.isExists) {
          replaceArnArrayForUpdate.push({
            "flowName": subAgentWhisperFlowContenActions.primarySubContactFlowName,
            "sourceFlowArn": subAgentWhisperFlowContenActions.targetSubContactFlowArn,
            "targetFlowArn": subAgentWhisperFlowContenActions.primarySubContactFlowName
          });
         }
         if (subAgentWhisperFlowContenActions.contentActionsSubContactFlow.length > 0) {
          queue.push(...subAgentWhisperFlowContenActions.contentActionsSubContactFlow);
        }
      } 
      else if (obj.Parameters.EventHooks.CustomerQueue) {
        console.log('obj : ', obj);
        const subCustQueueFlowArn = obj && obj.Parameters && obj.Parameters.EventHooks && obj.Parameters.EventHooks.CustomerQueue ? obj.Parameters.EventHooks.CustomerQueue : undefined;
        const subCustQueueFlowContenActions = await subContactFlowHandling(primaryContactFlows, subCustQueueFlowArn, targetContactFlows, instanceArn, sourceRegion, targetRegion);
        subContactFlowsArray.push({
          "contactFlowArn": subCustQueueFlowArn,
          "contactFlowName": subCustQueueFlowContenActions.primarySubContactFlowName,
          "contactFlowType": subCustQueueFlowContenActions.primarySubContactFlowType,
          "targetJson": subCustQueueFlowContenActions.targetJsonSubContactFlow,
          "contentActions": subCustQueueFlowContenActions.contentActionsSubContactFlow,
          "isExists": subCustQueueFlowContenActions.isExists,
          "targetContactFlowId": subCustQueueFlowContenActions.targetSubContactFlowId, 
          "priority": count++
        });
        if (subCustQueueFlowContenActions.isExists) {
          replaceArnArrayForUpdate.push({
            "flowName": subCustQueueFlowContenActions.primarySubContactFlowName,
            "sourceFlowArn": subCustQueueFlowContenActions.targetSubContactFlowArn,
            "targetFlowArn": subCustQueueFlowContenActions.primarySubContactFlowName
          });
        }
        if (subCustQueueFlowContenActions.contentActionsSubContactFlow.length > 0) {
          queue.push(...subCustQueueFlowContenActions.contentActionsSubContactFlow);
        }
      } 
      else if (obj.Parameters.EventHooks.CustomerRemaining) {
        console.log('obj : ', obj);
        const subCustRemFlowArn = obj && obj.Parameters && obj.Parameters.EventHooks && obj.Parameters.EventHooks.CustomerRemaining ? obj.Parameters.EventHooks.CustomerRemaining : undefined;
        const subCustRemFlowContenActions = await subContactFlowHandling(primaryContactFlows, subCustRemFlowArn, targetContactFlows, instanceArn, sourceRegion, targetRegion);
        subContactFlowsArray.push({
         "contactFlowArn": subCustRemFlowArn,
         "contactFlowName": subCustRemFlowContenActions.primarySubContactFlowName,
         "contactFlowType": subCustRemFlowContenActions.primarySubContactFlowType,
          "targetJson": subCustRemFlowContenActions.targetJsonSubContactFlow,
         "contentActions": subCustRemFlowContenActions.contentActionsSubContactFlow,
         "isExists": subCustRemFlowContenActions.isExists,
         "targetContactFlowId": subCustRemFlowContenActions.targetSubContactFlowId,
         "priority": count++
        });
        if (subCustRemFlowContenActions.isExists) {
          replaceArnArrayForUpdate.push({
            "flowName": subCustRemFlowContenActions.primarySubContactFlowName,
            "sourceFlowArn": subCustRemFlowContenActions.targetSubContactFlowArn,
            "targetFlowArn": subCustRemFlowContenActions.primarySubContactFlowName
          });
        }
        if (subCustRemFlowContenActions.contentActionsSubContactFlow.length > 0) {
          queue.push(...subCustRemFlowContenActions.contentActionsSubContactFlow);
        }
    }
  } else if (obj.Type === 'TransferToFlow') {
    console.log('obj : ', obj);
    const subCustomFlowArn = obj && obj.Parameters && obj.Parameters.ContactFlowId ? obj.Parameters.ContactFlowId : undefined;
    const subCustomFlowContenActions = await subContactFlowHandling(primaryContactFlows, subCustomFlowArn, targetContactFlows, instanceArn, sourceRegion, targetRegion);
    subContactFlowsArray.push({
      "contactFlowArn": subCustomFlowArn,
      "contactFlowName": subCustomFlowContenActions.primarySubContactFlowName,
      "contactFlowType": subCustomFlowContenActions.primarySubContactFlowType,
      "targetJson": subCustomFlowContenActions.targetJsonSubContactFlow,
      "contentActions": subCustomFlowContenActions.contentActionsSubContactFlow,
      "isExists": subCustomFlowContenActions.isExists,
      "targetContactFlowId": subCustomFlowContenActions.targetSubContactFlowId,
      "priority": count++
    });
    if (subCustomFlowContenActions.isExists) {
      replaceArnArrayForUpdate.push({
        "flowName": subCustomFlowContenActions.primarySubContactFlowName,
        "sourceFlowArn": subCustomFlowContenActions.targetSubContactFlowArn,
        "targetFlowArn": subCustomFlowContenActions.primarySubContactFlowName
      });
    }
    if (subCustomFlowContenActions.contentActionsSubContactFlow.length > 0) {
      queue.push(...subCustomFlowContenActions.contentActionsSubContactFlow);
    }

  } else {
    console.log(`No handling for the type : ${obj.Type}`);
  }
}
}

await handleContentActions(contentActions);
await writeDataToFile('subContactFlowsArray.json', subContactFlowsArray);

// Create a Set to store processed contactFlowArn values
const processedArns = new Set();

for (let i=0; i<subContactFlowsArray.length; i++) {
  let obj = subContactFlowsArray[i];

  // If this contactFlowArn has already been processed, skip to the next iteration
  if (processedArns.has(obj.contactFlowArn)) {
    continue;
  }

  const getMissedResourcesResponse = await getMissedResources(obj.targetJson, obj.contentActions, obj.contactFlowName, primaryQueues, targetQueues, 
    primaryHOP, targetHOP, primaryLexBot, targetLexBot, primaryLambda, targetLambda, sourceRegion, targetRegion);
    // console.log('getMissedResourcesResponse : ', getMissedResourcesResponse);
    missedResourcesInTarget = missedResourcesInTarget.concat(getMissedResourcesResponse.missedResourcesInTarget);
    arrayToCreateOrUpdateFlow.push({
      "isExist": obj.isExists,
      "flowName": obj.contactFlowName,
      "flowArn": obj.contactFlowArn,
      "targetInstanceArn": targetInstanceArn,
      "contactFlowType": obj.contactFlowType,
      "targetJson": getMissedResourcesResponse.targetJson,
      "targetFlowId": obj.targetContactFlowId,
      "targetRegion": targetRegion,
      "priority": priority++
    });

  // Add the contactFlowArn to the Set of processed Arns
  processedArns.add(obj.contactFlowArn);
}

// for (let i = 0; i < contentActions.length; i++) {
//     let obj = contentActions[i];
//     console.log(`Type value: ${obj.Type}`);
//         if (obj.Type === 'UpdateContactEventHooks') {
//           console.log('Inside Event Hooks Handling');
//           if (obj.Parameters.EventHooks.AgentWhisper) {
//             console.log('Inside Agent Whisper Handling');
//             console.log('obj : ', obj);
//             // let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.AgentWhisper, TARGETCFS);
//             // if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.AgentWhisper, 'g'), arn)};
//           } 
//         else if (obj.Parameters.EventHooks.CustomerQueue) {
//           console.log('Inside Customer Queue Handling');
//           console.log('obj : ', obj);
//           const subCustomerQueueFlowArn = obj && obj.Parameters && obj.Parameters.EventHooks && obj.Parameters.EventHooks.CustomerQueue ? obj.Parameters.EventHooks.CustomerQueue : undefined;
//           console.log('subCustomerQueueFlowArn : ', subCustomerQueueFlowArn);
//           const subContactFlowHandlingRes = await subContactFlowHandling(primaryContactFlows, subCustomerQueueFlowArn, targetContactFlows, instanceArn, sourceRegion, targetRegion);
//           // console.log('subContactFlowHandlingRes : ', subContactFlowHandlingRes);
//           await writeDataToFile('subContactFlowHandlingRes.json', subContactFlowHandlingRes);
//           const getMissedResourcesResCustomerQueue = await getMissedResources(subContactFlowHandlingRes.targetJsonSubContactFlow, subContactFlowHandlingRes.contentActionsSubContactFlow, subContactFlowHandlingRes.primarySubContactFlowName, primaryQueues, targetQueues, 
//             primaryHOP, targetHOP, primaryLexBot, targetLexBot, primaryLambda, targetLambda, sourceRegion, targetRegion);
//             // console.log('getMissedResourcesResCustomerQueue : ', getMissedResourcesResCustomerQueue);
//             missedResourcesInTarget = missedResourcesInTarget.concat(getMissedResourcesResCustomerQueue.missedResourcesInTarget);
           
//             arrayToCreateOrUpdateFlow.push({
//             "isExist": subContactFlowHandlingRes.isExists,
//             "flowName": subContactFlowHandlingRes.primarySubContactFlowName,
//             "targetInstanceArn": targetInstanceArn,
//             "contactFlowType": subContactFlowHandlingRes.primarySubContactFlowType,
//             "targetJson": getMissedResourcesResCustomerQueue.targetJson,
//             "targetFlowId": subContactFlowHandlingRes.targetSubContactFlowId,
//             "targetRegion": targetRegion,
//             "priority": priority++
//           }); 
//         } 
//         else if (obj.Parameters.EventHooks.CustomerRemaining) {
//           console.log('Inside Customer Remaining Handling');
//           console.log('obj : ', obj);
//             // let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.CustomerRemaining, TARGETCFS);
//             // if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.CustomerRemaining, 'g'), arn)};
//           }
        
//         } else if (obj.Type === 'TransferToFlow') {
//           console.log('Inside Transfer To Flow Handling');
//           console.log('obj : ', obj);
//           // obj :  {
//           //   Parameters: {
//           //     ContactFlowId: 'arn:aws:connect:us-east-1:***:instance/4bbee21d-72b8-442b-af39-dce4128ca77e/contact-flow/b749f800-b086-4a4a-b86e-46757697729d'
//           //   },
//           //   Identifier: '51765364-1767-47e1-a3af-2ceb205d097e',
//           //   Type: 'TransferToFlow',
//           //   Transitions: {
//           //     NextAction: '11a9b95b-a27d-46aa-a828-b7bf4b9e65c9',
//           //     Errors: [ [Object] ]
//           //   }
//           // }
//           const subTransferToFlowFlowArn = obj && obj.Parameters && obj.Parameters.ContactFlowId ? obj.Parameters.ContactFlowId : undefined;
//           console.log('subTransferToFlowFlowArn : ', subTransferToFlowFlowArn);
//           const subTransferToFlowHandlingRes = await subContactFlowHandling(primaryContactFlows, subTransferToFlowFlowArn, targetContactFlows, instanceArn, sourceRegion, targetRegion);
//           // console.log('subTransferToFlowHandlingRes : ', subTransferToFlowHandlingRes);
//           await writeDataToFile('subTransferToFlowHandlingRes.json', subTransferToFlowHandlingRes);
//           const getMissedResourcesResTransferToFlow = await getMissedResources(subTransferToFlowHandlingRes.targetJsonSubContactFlow, subTransferToFlowHandlingRes.contentActionsSubContactFlow, subTransferToFlowHandlingRes.primarySubContactFlowName, primaryQueues, targetQueues, 
//             primaryHOP, targetHOP, primaryLexBot, targetLexBot, primaryLambda, targetLambda, sourceRegion, targetRegion);
//             // console.log('getMissedResourcesResTransferToFlow : ', getMissedResourcesResTransferToFlow);
//             await writeDataToFile('getMissedResourcesResTransferToFlow.json', getMissedResourcesResTransferToFlow);
//             missedResourcesInTarget = missedResourcesInTarget.concat(getMissedResourcesResTransferToFlow.missedResourcesInTarget);
//            priority = priority + 1;
//             arrayToCreateOrUpdateFlow.push({
//             "isExist": subTransferToFlowHandlingRes.isExists,
//             "flowName": subTransferToFlowHandlingRes.primarySubContactFlowName,
//             "targetInstanceArn": targetInstanceArn,
//             "contactFlowType": subTransferToFlowHandlingRes.primarySubContactFlowType,
//             "targetJson": getMissedResourcesResTransferToFlow.targetJson,
//             "targetFlowId": subTransferToFlowHandlingRes.targetSubContactFlowId,
//             "targetRegion": targetRegion,
//             "priority": priority
//           }); 
//         } else {
//           console.log(`No handling for the type : ${obj.Type}`);
//         }
// }

await writeDataToFile('missedResourcesInTargetUpdated.json', missedResourcesInTarget);
await writeDataToFile('arrayToCreateOrUpdateFlowUpdated.json', arrayToCreateOrUpdateFlow);
await writeDataToFile('targetJsonUpdated.json', JSON.parse(targetJson));
contentActions = JSON.parse(targetJson).Actions;
// console.log("contentActions After Replacing", contentActions);
await writeDataToFile('contentActionsUpdated.json', contentActions);
if (missedResourcesInTarget.length > 0) {
  // Writing missedResourcesInTarget to files
    // console.log('missedResourcesInTarget : ', missedResourcesInTarget);
    // await writeDataToFile('missedResourcesInTarget.json', missedResourcesInTarget);
    console.log('Note : Please create the missed resources in target instance');
} 
else {
  
  console.log('No missed resources in target instance');
  await createOrUpdateFlow(arrayToCreateOrUpdateFlow, replaceArnArrayForUpdate)
}
}