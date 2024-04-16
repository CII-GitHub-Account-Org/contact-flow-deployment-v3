import AWS from 'aws-sdk';
import fs from 'fs';
import path from 'path';
const connect = new AWS.Connect();
const INSTANCEARN = process.env.SOURCE_INSTANCEARN;
const TRAGETINSTANCEARN = process.env.TRAGET_INSTANCEARN;
let FLOWNAME = process.env.FLOWNAME;
let CONTACTFLOWTYPE = process.env.CONTACTFLOWTYPE;
const REGION = process.env.REGION;
const RETRY_ATTEMPTS = process.env.RETRY_ATTEMPTS;
console.log('INSTANCEARN', INSTANCEARN);
console.log('TRAGETINSTANCEARN', TRAGETINSTANCEARN);
console.log('FLOWNAME', FLOWNAME);
console.log('CONTACTFLOWTYPE', CONTACTFLOWTYPE);
console.log('REGION', REGION);
console.log('RETRY_ATTEMPTS', RETRY_ATTEMPTS);
let PRIMARYFLOWID = '';
let isExist;
let TARGETJSON ='';
let TARGETFLOWID = '';
let PRIMARYPROMPTS = '';
let TARGETPROMPTS = '';
let PRIMARYBOT = '';
let TARGETBOT = '';
let PRIMARYCFS = '';
let TARGETCFS = '';
let PRIMARYQUEUES = [];
let TARGETQUEUES = [];
let PRIMARYUSERS = '';
let TARGETUSERS = '';
let PRIMARYQC = '';
let TARGETQC = '';
let PRIMARYHOP = '';
let TARGETHOP = '';
const instanceIdParam = {
  InstanceId: INSTANCEARN // replace with your instance id
};
const targetInstanceIdParam = {
  InstanceId: TRAGETINSTANCEARN // replace with your target instance id
};


let responsePrimaryQueue = await connect.listQueues(instanceIdParam).promise();
PRIMARYQUEUES.push(responsePrimaryQueue);
const paramsQueuePrimary = {
  InstanceId: INSTANCEARN, /* required */
  MaxResults: 1000,
};
while (PRIMARYQUEUES[PRIMARYQUEUES.length - 1].NextToken) {
  const token = PRIMARYQUEUES[PRIMARYQUEUES.length - 1].NextToken;
  paramsQueuePrimary.NextToken = token;
  // console.log('paramsQueuePrimary', paramsQueuePrimary);
  responsePrimaryQueue = await listQueuesFunc(paramsQueuePrimary, RETRY_ATTEMPTS);
  PRIMARYQUEUES.push(responsePrimaryQueue);
};
// console.log('PRIMARYQUEUES', JSON.stringify(PRIMARYQUEUES));
const outputPath1 = path.resolve(process.cwd(), 'PRIMARYQUEUES.json');
console.log('Writing data to file...');
fs.writeFileSync(outputPath1, JSON.stringify(PRIMARYQUEUES, null, 2));
console.log(`Data written to ${outputPath1}`)


let responseTargetQueue = await connect.listQueues(targetInstanceIdParam).promise();
TARGETQUEUES.push(responseTargetQueue);
const paramsQueueTarget = {
  InstanceId: TRAGETINSTANCEARN, /* required */
  MaxResults: 1000,
};
while (TARGETQUEUES[TARGETQUEUES.length - 1].NextToken) {
  const token = TARGETQUEUES[TARGETQUEUES.length - 1].NextToken;
  paramsQueueTarget.NextToken = token;
  // console.log('paramsQueueTarget', paramsQueueTarget);
  responseTargetQueue = await listQueuesFunc(paramsQueueTarget, RETRY_ATTEMPTS);
  TARGETQUEUES.push(responseTargetQueue);
};
// console.log('TARGETQUEUES', JSON.stringify(TARGETQUEUES));
const outputPath2 = path.resolve(process.cwd(), 'TARGETQUEUES.json');
console.log('Writing data to file...');
fs.writeFileSync(outputPath2, JSON.stringify(TARGETQUEUES, null, 2));
console.log(`Data written to ${outputPath2}`);
// async function handleConnectAPI(){
//     const instanceIdParam = {
//         InstanceId: INSTANCEARN // replace with your instance id
//       };
//     await connect.listPrompts(instanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('PRIMARYPROMPTS', data)
//                 PRIMARYPROMPTS = data;
//                 };            // successful response
//       }).promise();

//       const targetInstanceIdParam = {
//         InstanceId: TRAGETINSTANCEARN // replace with your target instance id
//       };
//       await connect.listPrompts(targetInstanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('TARGETPROMPTS', data)
//                 TARGETPROMPTS = data;
//                 };            // successful response
//       }).promise();
//       await connect.listLexBots(instanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('PRIMARYBOT', data)
//                 PRIMARYBOT = data;
//                 };            // successful response
//       }).promise();
//       await connect.listLexBots(targetInstanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('TARGETBOT', data)
//                 TARGETBOT = data;
//                 };            // successful response
//       }).promise();
      
//         const instanceIdParamList = {
//             InstanceId: INSTANCEARN,
//             ContactFlowTypes: [
//               CONTACTFLOWTYPE
//           ]};
//        const instanceIdTargetParamList = {
//          InstanceId: TRAGETINSTANCEARN,
//          ContactFlowTypes: [
//           CONTACTFLOWTYPE
//         ]};

    
//       await connect.listContactFlows(instanceIdParamList, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('PRIMARYCFS', data)
//                 PRIMARYCFS = data;
//                 };            // successful response
//       }).promise();

//       await connect.listContactFlows(instanceIdTargetParamList, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('TARGETCFS', data)
//                 TARGETCFS = data;
//                 };            // successful response
//       }).promise();
//       await connect.listUsers(instanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('PRIMARYUSERS', data)
//                 PRIMARYUSERS = data;
//                 };            // successful response
//       }).promise();
//       await connect.listUsers(targetInstanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('TARGETUSERS', data)
//                 TARGETUSERS = data;
//                 };            // successful response
//       }).promise();
//       // await connect.listQueues(instanceIdParam, function(err, data) {
//       //   if (err) console.log(err, err.stack); // an error occurred
//       //   else    { 
//       //           PRIMARYQUEUES = data;
//       //           console.log('PRIMARYQUEUES', data)
//       //           };            // successful response
//       // }).promise();
//       await connect.listQueues(instanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 PRIMARYQUEUES.push(data);
//                 console.log('PRIMARYQUEUES', PRIMARYQUEUES)
//                 };            // successful response
//       }).promise();
      
//       // var paramsQueue = {
//       //   InstanceId: INSTANCEARN, /* required */
//       //   MaxResults: 1000,
//       // };
      
//       // while (PRIMARYQUEUES[PRIMARYQUEUES.length - 1].NextToken) {
//       //   const token = PRIMARYQUEUES[PRIMARYQUEUES.length - 1].NextToken;
//       //   paramsQueue.NextToken = token;
//       //   console.log('paramsQueue',paramsQueue);
//       //   let newQueues = await listQueuesFunc(paramsQueue, RETRY_ATTEMPTS);
//       //   PRIMARYQUEUES.push(newQueues);
//       // }
//       // console.log('PRIMARYQUEUES', PRIMARYQUEUES)

//       await connect.listQueues(targetInstanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 TARGETQUEUES = data;
//                 // console.log('TARGETQUEUES', data)
//                 };            // successful response
//       }).promise();
//       await connect.listQuickConnects(instanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('PRIMARYQC', data)
//                 PRIMARYQC = data;
//                 };            // successful response
//       }).promise();
//       await connect.listQuickConnects(targetInstanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('TARGETQC', data)
//                 TARGETQC = data;
//                 };            // successful response
//       }).promise();
//       await connect.listHoursOfOperations(instanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('PRIMARYHOP', data)
//                 PRIMARYHOP = data;
//                 };            // successful response
//       }).promise();
//       await connect.listHoursOfOperations(targetInstanceIdParam, function(err, data) {
//         if (err) console.log(err, err.stack); // an error occurred
//         else    { 
//                 // console.log('TARGETHOP', data)
//                 TARGETHOP = data;
//                 };            // successful response
//       }).promise();
// }

// await handleConnectAPI();

// // flowArn = 'arn:aws:connect:us-east-1:750344256621:instance/561af6e6-7907-4131-9f18-71b466e8763e/contact-flow/30a04cc3-44c6-4f30-aeb2-13155235c6d3';
// let instanceIdTargetParamListP = {
//   InstanceId: INSTANCEARN,
//   ContactFlowTypes: [
//    CONTACTFLOWTYPE
//  ],
//   MaxResults: 1000
// };
// let primaryFlowArn = getPrimaryFlowId(PRIMARYCFS, FLOWNAME);

// if (!primaryFlowArn){
//   while (PRIMARYCFS.NextToken) {

//     const token = PRIMARYCFS.NextToken;
//     instanceIdTargetParamListP.NextToken = token;
//     console.log('instanceIdTargetParamListP',instanceIdTargetParamListP);
//     PRIMARYCFS = await listContactFlowFunc(instanceIdTargetParamListP, RETRY_ATTEMPTS);
//     primaryFlowArn = getPrimaryFlowId(PRIMARYCFS, FLOWNAME);
//      // If primaryFlowArn exists, break the loop
//      if (primaryFlowArn) {
//       console.log('primaryFlowArn', primaryFlowArn);
//       break;
//     }
//   }
// }


// PRIMARYFLOWID = primaryFlowArn.split('/')[3];
// console.log('PRIMARYFLOWID', PRIMARYFLOWID);

// async function describeContactFlow(instanceId, PRIMARYFLOWID, region) {
//   AWS.config.update({ region });
//   const params = {
//       InstanceId: instanceId,
//       ContactFlowId: PRIMARYFLOWID
//   };
//   let data = await connect.describeContactFlow(params).promise();
//   return data;
// }
// const data = await describeContactFlow(INSTANCEARN, PRIMARYFLOWID, REGION);

// console.log('Data:',data);
// const flow = data;
// const content = flow.ContactFlow.Content;
// TARGETJSON = content;


// let instanceIdTargetParamListT = {
//   InstanceId: TRAGETINSTANCEARN,
//   ContactFlowTypes: [
//    CONTACTFLOWTYPE
//  ],
//   MaxResults: 1000
// };
// let targetFlowArn = await getFlowId(primaryFlowArn, TARGETCFS, FLOWNAME);

// if (!targetFlowArn){
//   while (TARGETCFS.NextToken) {

//     const token = TARGETCFS.NextToken;
//     instanceIdTargetParamListT.NextToken = token;
//     console.log('instanceIdTargetParamListT',instanceIdTargetParamListT);
//     TARGETCFS = await listContactFlowFunc(instanceIdTargetParamListT, RETRY_ATTEMPTS);
//     targetFlowArn = await getFlowId(primaryFlowArn, TARGETCFS, FLOWNAME);
//      // If targetFlowArn exists, break the loop
//      if (targetFlowArn) {
//       console.log('targetFlowArn', targetFlowArn);
//       break;
//     }
//   }
// }

// // let flowArn = getFlowId(PRIMARYCFS, flow.ContactFlow.Arn, TARGETCFS);
// if (targetFlowArn) {
//     console.log('taking TARGETFLOWID from targetFlowArn', targetFlowArn);
//     TARGETFLOWID = targetFlowArn.split('/')[3];
//     isExist = true;
//     console.log(`Need to update flowId : ${TARGETFLOWID}`);
// } else {
//     isExist = false;
// }



// let contentActions = JSON.parse(content).Actions;
// console.log("contentActions Before Replacing", contentActions);

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

// contentActions = JSON.parse(content).Actions;
// console.log("contentActions After Replacing", contentActions);

// async function createOrUpdateFlow(isExist, FLOWNAME, CONTACTFLOWTYPE, TARGETJSON, TARGETFLOWID) {
//     console.log('isExist: ',isExist);
//     if (!isExist) {
//         const params = {
//             InstanceId: TRAGETINSTANCEARN,
//             Name: FLOWNAME,
//             Type: CONTACTFLOWTYPE,
//             Content: TARGETJSON
//         };
//         console.log("params: ", params);
//         try {
//             const data = await connect.createContactFlow(params).promise();
//             console.log(data);
//             console.log('NEW FLOW HAS BEEN CREATED');
//         } catch (error) {
//             console.error(error);
//         }
//     } else {
//         console.log("Updating Flow");

//         const params = {
//             InstanceId: TRAGETINSTANCEARN,
//             ContactFlowId: TARGETFLOWID,
//             Content: TARGETJSON
//         };
//         console.log("params: ", params);
//         try {
//             const data = await connect.updateContactFlowContent(params).promise();
//             console.log(data);
//             console.log('FLOW HAS BEEN UPDATED');
//         } catch (error) {
//             console.error(error);
//         }
//     }
// }

// await createOrUpdateFlow(isExist, FLOWNAME, CONTACTFLOWTYPE, TARGETJSON, TARGETFLOWID);


// function getPrimaryFlowId(primary, flowName) {
//   let rId = '';
//   const pl = primary;
  
//   console.log(`Searching for flowName : ${flowName}`);


//   const primaryObj = pl && pl.ContactFlowSummaryList ? pl.ContactFlowSummaryList.find(obj => obj.Name === flowName) : undefined;
//   if (primaryObj) {
//     rId = primaryObj.Arn;
//     console.log(`Found flow Arn : ${rId}`);
//     return rId;
//   } else {
//     console.log('Not Found Primary Contact Flow');
//     return undefined;
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

// function getUserId(primary, userId, target) {
//   const pl = primary;
//   const tl = target;
//   let fName = '';
//   let rId = '';

//   console.log(`Searching for userId : ${userId}`);

//   for (let i = 0; i < pl.UserSummaryList.length; i++) {
//       const obj = pl.UserSummaryList[i];
//       if (obj.Arn === userId) {
//           fName = obj.Username;
//           console.log(`Found user name : ${fName}`);
//           break;
//       }
//   }

//   console.log(`Searching for userId for : ${fName}`);

//   for (let i = 0; i < tl.UserSummaryList.length; i++) {
//       const obj = tl.UserSummaryList[i];
//       if (obj.Username === fName) {
//           rId = obj.Arn;
//           console.log(`Found flow id : ${rId}`);
//           return rId;
//       } else if (i === tl.UserSummaryList.length - 1) {
//           console.log('create user');
//           return undefined;
//       }
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

// function getPromptId(primary, searchId, target) {
//     const pl = primary;
//     const tl = target;
//     let fName = '';
//     let rId = '';
  
//     console.log(`Searching for promptId : ${searchId}`);
  
//     const primaryObj = pl.PromptSummaryList.find(obj => obj.Arn === searchId);
//     if (primaryObj) {
//       fName = primaryObj.Name;
//       console.log(`Found name : ${fName}`);
//     }
  
//     console.log(`Searching for prompt for : ${fName}`);
  
//     const targetObj = tl && tl.PromptSummaryList ? tl.PromptSummaryList.find(obj => obj.Name === fName) : undefined;
//     if (targetObj) {
//       rId = targetObj.Arn;
//       console.log(`Found id : ${rId}`);
//       return rId;
//     } else {
//     //   console.log('prompt cant created');
//       console.log('Prompt Not Found Please Create prompt');
//       return undefined;
//     }
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

// async function listContactFlowFunc (params, retryAttempts) {
//   try {
//     let doRetry = false;
//     do {
//       doRetry = false;
//       try {
//         let listContactFlows = ''; 
//         listContactFlows = await connect.listContactFlows(params, function(err, data) {
//           if (err) console.log(err, err.stack); // an error occurred
//           else    { 
//                   // console.log('PRIMARYCFS', data)
//                   listContactFlows = data;
//                   };            // successful response
//          }).promise();
//         if (listContactFlows) {
//           return listContactFlows;
//         } else {
//           return null;
//         }
//       } catch (error) {
//         console.log(
//           'error::',
//           (error)
//         );
//         if (error.code === 'TooManyRequestsException' && (retryAttempts || 3)> 0) {
//           await sleep(parseInt(2500, 10) || 1000);
//           --retryAttempts;
//           doRetry = true;
//           console.log('doRetry::', doRetry);
//         } else {
//           return error;
//         }
//       }
//     } while (doRetry);
//   } catch (error) {
//     console.log('error::', error);
//     return error;
//   }
// };









async function listQueuesFunc (params, retryAttempts) {
  try {
    let doRetry = false;
    do {
      doRetry = false;
      try {
        let listQueues = ''; 
        listQueues = await connect.listQueues(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else    { 
                  // console.log('listQueues', data)
                  listQueues = data;
                  };            // successful response
         }).promise();
        if (listQueues) {
          return listQueues;
        } else {
          return null;
        }
      } catch (error) {
        console.log(
          'error::',
          (error)
        );
        if (error.code === 'TooManyRequestsException' && (retryAttempts || 3)> 0) {
          await sleep(parseInt(2500, 10) || 1000);
          --retryAttempts;
          doRetry = true;
          console.log('doRetry::', doRetry);
        } else {
          return error;
        }
      }
    } while (doRetry);
  } catch (error) {
    console.log('error::', error);
    return error;
  }
};