import AWS from 'aws-sdk';
const connect = new AWS.Connect();

// const INSTANCEARN = 'arn:aws:connect:us-east-1:750344256621:instance/4bbee21d-72b8-442b-af39-dce4128ca77e';
// const TRAGETINSTANCEARN = 'arn:aws:connect:us-east-1:750344256621:instance/561af6e6-7907-4131-9f18-71b466e8763e';
const INSTANCEARN = process.env.SOURCE_INSTANCEARN;
const TRAGETINSTANCEARN = process.env.TRAGET_INSTANCEARN;
console.log('INSTANCEARN', INSTANCEARN);
console.log('TRAGETINSTANCEARN', TRAGETINSTANCEARN);
// let FLOWID = 'a222d77e-f37a-42f6-b00e-9a3a1671e9bc';
// let FLOWID = '0b2985cd-e5e9-4a64-8190-b73e294cec59';
let FLOWNAME = 'copilot-test-contact-flow';
let type = 'CONTACT_FLOW';
let isExist;
let TARGETJSON ='';
let TARGETFLOWID = '';
let PRIMARYPROMPTS = '';
let TARGETPROMPTS = '';
let PRIMARYBOT = '';
let TARGETBOT = '';
let PRIMARYCFS = '';
let TARGETCFS = '';
let PRIMARYQUEUES = '';
let TARGETQUEUES = '';
let PRIMARYUSERS = '';
let TARGETUSERS = '';
let PRIMARYQC = '';
let TARGETQC = '';
let PRIMARYHOP = '';
let TARGETHOP = '';


async function handleConnectAPI(){
    const instanceIdParam = {
        InstanceId: INSTANCEARN // replace with your instance id
      };
    await connect.listPrompts(instanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('PRIMARYPROMPTS', data)
                PRIMARYPROMPTS = data;
                };            // successful response
      }).promise();

      const targetInstanceIdParam = {
        InstanceId: TRAGETINSTANCEARN // replace with your target instance id
      };
      await connect.listPrompts(targetInstanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('TARGETPROMPTS', data)
                TARGETPROMPTS = data;
                };            // successful response
      }).promise();
      await connect.listLexBots(instanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('PRIMARYBOT', data)
                PRIMARYBOT = data;
                };            // successful response
      }).promise();
      await connect.listLexBots(targetInstanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('TARGETBOT', data)
                TARGETBOT = data;
                };            // successful response
      }).promise();
      
      const instanceIdParamList = {
        InstanceId: INSTANCEARN, // replace with your instance id
        MaxResults: 1000
      };
      const instanceIdTargetParamList = {
        InstanceId: TRAGETINSTANCEARN, // replace with your instance id
        MaxResults: 1000
      };

    
      await connect.listContactFlows(instanceIdParamList, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                console.log('PRIMARYCFS', data)
                PRIMARYCFS = data;
                };            // successful response
      }).promise();

     


      await connect.listContactFlows(instanceIdTargetParamList, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                console.log('TARGETCFS', data)
                TARGETCFS = data;
                };            // successful response
      }).promise();
      await connect.listUsers(instanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('PRIMARYUSERS', data)
                PRIMARYUSERS = data;
                };            // successful response
      }).promise();
      await connect.listUsers(targetInstanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('TARGETUSERS', data)
                TARGETUSERS = data;
                };            // successful response
      }).promise();
      await connect.listQueues(instanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('PRIMARYQUEUES', data)
                PRIMARYQUEUES = data;
                };            // successful response
      }).promise();
      await connect.listQueues(targetInstanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('TARGETQUEUES', data)
                TARGETQUEUES = data;
                };            // successful response
      }).promise();
      await connect.listQuickConnects(instanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('PRIMARYQC', data)
                PRIMARYQC = data;
                };            // successful response
      }).promise();
      await connect.listQuickConnects(targetInstanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('TARGETQC', data)
                TARGETQC = data;
                };            // successful response
      }).promise();
      await connect.listHoursOfOperations(instanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('PRIMARYHOP', data)
                PRIMARYHOP = data;
                };            // successful response
      }).promise();
      await connect.listHoursOfOperations(targetInstanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('TARGETHOP', data)
                TARGETHOP = data;
                };            // successful response
      }).promise();
}

await handleConnectAPI();
// flowArn = 'arn:aws:connect:us-east-1:750344256621:instance/561af6e6-7907-4131-9f18-71b466e8763e/contact-flow/30a04cc3-44c6-4f30-aeb2-13155235c6d3';
let PRIMARYFLOWID = 'a222d77e-f37a-42f6-b00e-9a3a1671e9bc';
// let primaryFlowArn = getPrimaryFlowId(PRIMARYCFS, FLOWNAME);
// PRIMARYFLOWID = primaryFlowArn.split('/')[3];
// console.log('PRIMARYFLOWID', PRIMARYFLOWID);

let flowArn = getFlowId(PRIMARYCFS, flow.ContactFlow.Arn, TARGETCFS);
if (flowArn) {
    let flowArnSplit = flowArn.split('/');
    TARGETFLOWID = flowArnSplit[3];
    isExist = true;
    console.log(`Need to update flowId : ${TARGETFLOWID}`);
} else {
    isExist = false;
}


async function describeContactFlow(instanceId, PRIMARYFLOWID, region) {
    AWS.config.update({ region });
    const params = {
        InstanceId: instanceId,
        ContactFlowId: PRIMARYFLOWID
    };
    let data = await connect.describeContactFlow(params).promise();
    return data;
}

const data = await describeContactFlow(INSTANCEARN, PRIMARYFLOWID, 'us-east-1');
// console.log('Data:',data);
const flow = data;
const content = flow.ContactFlow.Content;
TARGETJSON = content;
// let flowName = getFlowName(PRIMARYCFS, flow.ContactFlow.Arn);
// if (!flowName){
//   const instanceIdParamList = {
//     InstanceId: INSTANCEARN // replace with your instance id
//   };
//   while (!(PRIMARYCFS.nextToken === '')) {
//     const token = PRIMARYCFS.nextToken;
//     instanceIdParamList['nextToken'] = token;
//     PRIMARYCFS='';
//     PRIMARYCFS =  await connect.listContactFlows(instanceIdParamList, function(err, data) {
//       if (err) console.log(err, err.stack); // an error occurred
//       else    { 
//               // console.log('PRIMARYCFS', data)
//               PRIMARYCFS = data;
//               };            // successful response
//     }).promise();
//     flowName = getFlowName(PRIMARYCFS, flow.ContactFlow.Arn);
//     console.log('flowName: ', flowName);
//        // If flowName is found, break the loop
//        if (flowName) {
//         break;
//       }
//   }
// }
// console.log('flowName: ', flowName)

// let flowArn = getFlowId(flowName, flow.ContactFlow.Arn, TARGETCFS);
// if (!flowArn){
//   const instanceIdParamList = {
//     InstanceId: INSTANCEARN // replace with your instance id
//   };
//   while (!(TARGETCFS.nextToken === '')) {
//     const token = PRIMARYCFS.nextToken;
//     instanceIdParamList['nextToken'] = token;
//     TARGETCFS='';
//     TARGETCFS =  await connect.listContactFlows(instanceIdParamList, function(err, data) {
//       if (err) console.log(err, err.stack); // an error occurred
//       else    { 
//               // console.log('PRIMARYCFS', data)
//               TARGETCFS = data;
//               };            // successful response
//     }).promise();
//     flowArn = getFlowId(flowName, flow.ContactFlow.Arn, TARGETCFS);
//     console.log('flowArn: ', flowArn);
//        // If flowArn is found, break the loop
//        if (flowArn) {
//         break;
//       }
//   }
 
// }

// const flowArn = flow.ContactFlow.Arn;
// console.log('flowArn: ', flowArn)



const contentActions = JSON.parse(content).Actions;
// console.log("contentActions", contentActions);

for (let i = 0; i < contentActions.length; i++) {
  let obj = contentActions[i];
  console.log(`Type value: ${obj.Type}`);

  if (obj.Type === 'MessageParticipant') {
    if (obj.Parameters.PromptId !== null) {
      console.log('inside prompt');
      let arn = getPromptId(PRIMARYPROMPTS, obj.Parameters.PromptId, TARGETPROMPTS);
      if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.PromptId, 'g'), arn)};
    }
  } else if (obj.Type === 'ConnectParticipantWithLexBot') {
    console.log('inside lexbot');
    console.log('LEXBOT HANLDING YET TO DO');
    // let arn = getlexbotId(PRIMARYBOT, obj.Parameters.LexBot.Name, TARGETBOT);
    // handle lex bot
  } else if (obj.Type === 'UpdateContactTargetQueue') {
    console.log('inside queue');
    let arn = getQueueId(PRIMARYQUEUES, obj.Parameters.QueueId, TARGETQUEUES);
    if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.QueueId, 'g'), arn)};
  } 
  else if (obj.Type === 'UpdateContactEventHooks') {
    if (obj.Parameters.EventHooks.AgentWhisper) {
      let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.AgentWhisper, TARGETCFS);
      if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.AgentWhisper, 'g'), arn)};
    } 
  else if (obj.Parameters.EventHooks.CustomerQueue) {
      let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.CustomerQueue, TARGETCFS);
      if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.CustomerQueue, 'g'), arn)};
    } 
  else if (obj.Parameters.EventHooks.CustomerRemaining) {
      let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.CustomerRemaining, TARGETCFS);
      if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.CustomerRemaining, 'g'), arn)};
    }
  } 
  else if (obj.Type === 'InvokeLambdaFunction') {
    let lambdaId = getLambdaId(PRIMARYLAMBDA, obj.Parameters.LambdaFunctionARN, TARGETLAMBDA);
  } 
  else if (obj.Type === 'TransferToFlow') {
    let arn = getFlowId(PRIMARYCFS, obj.Parameters.ContactFlowId, TARGETCFS);
    if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.ContactFlowId, 'g'), arn)};
  } 
  else if (obj.Type === 'CheckHoursOfOperation') {
    let arn = getHOPId(PRIMARYHOP, obj.Parameters.HoursOfOperationId, TARGETHOP);
    if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.HoursOfOperationId, 'g'), arn)};
  } else {
    console.log(`No handling for ${JSON.stringify(obj.Parameters)} of type : ${obj.Type}`);
  }
}

async function createOrUpdateFlow(isExist, FLOWNAME, type, TARGETJSON, TARGETFLOWID) {
    // isExist = false;
    console.log('isExist: ',isExist);
    if (!isExist) {
        const params = {
            InstanceId: TRAGETINSTANCEARN,
            Name: FLOWNAME,
            Type: type,
            Content: TARGETJSON
        };
        console.log("params: ", params);
        try {
            const data = await connect.createContactFlow(params).promise();
            console.log(data);
            console.log('NEW FLOW HAS BEEN CREATED');
        } catch (error) {
            console.error(error);
        }
    } else {
        console.log("Updating Flow");

        const params = {
            InstanceId: TRAGETINSTANCEARN,
            ContactFlowId: TARGETFLOWID,
            Content: TARGETJSON
        };
        console.log("params: ", params);
        try {
            const data = await connect.updateContactFlowContent(params).promise();
            console.log(data);
            console.log('FLOW HAS BEEN UPDATED');
        } catch (error) {
            console.error(error);
        }
    }
}

await createOrUpdateFlow(isExist, FLOWNAME, type, TARGETJSON, TARGETFLOWID);

// function getFlowName(primary, flowId) {
//   const pl = primary;
//   let fName = '';


//   console.log(`Searching for flowId : ${flowId}`);

//   const primaryObj = pl && pl.ContactFlowSummaryList ? pl.ContactFlowSummaryList.find(obj => obj.Arn === flowId) : undefined;
//   if (primaryObj) {
//     fName = primaryObj.Name;
//     console.log(`Found flow name : ${fName}`);
//     return fName;
//   } else {
//     return undefined
//   }

// }



function getPrimaryFlowId(primary, flowName) {
  let rId = '';
  const pl = primary;
  
  console.log(`Searching for flowName : ${flowName}`);


  const primaryObj = pl && pl.ContactFlowSummaryList ? pl.ContactFlowSummaryList.find(obj => obj.Name === flowName) : undefined;
  if (primaryObj) {
    rId = primaryObj.Arn;
    console.log(`Found flow Arn : ${rId}`);
    return rId;
  } else {
    console.log('Not Found Primary Contact Flow');
    return undefined;
  }
}

function getFlowId(primary, flowId, target) {
  const tl = target;
  let rId = '';
  const pl = primary;
  let fName = '';

  console.log(`Searching for flowId : ${flowId}`);


  const primaryObj = pl && pl.ContactFlowSummaryList ? pl.ContactFlowSummaryList.find(obj => obj.Arn === flowId) : undefined;
  if (primaryObj) {
    fName = primaryObj.Name;
    console.log(`Found flow name : ${fName}`);
  }

  console.log(`Searching for flow name : ${fName}`);
  const targetObj = tl && tl.ContactFlowSummaryList ? tl.ContactFlowSummaryList.find(obj => obj.Name === fName) : undefined;
  if (targetObj) {
    rId = targetObj.Arn;
    console.log(`Found flow id : ${rId}`);
    return rId;
  } else {




    console.log('Not Found Contact Flow, Please create contact flow');
    return undefined;
  }
}





function getLambdaId(primary, lambdaId, target) {
  const pl = primary;
  const tl = target;
  const lambda = lambdaId.split(':');
  let fName = '';
  let rId = '';

  console.log(`Searching for LambdaId : ${lambdaId}`);

  const primaryObj = pl && pl.LambdaFunctions ? pl.LambdaFunctions.find(obj => {
    const plName = obj.split(':');
    return plName[6] === lambda[6];
  }) : undefined;

  if (primaryObj) {
    fName = primaryObj.split(':')[6];
    console.log(`Found lambda name : ${fName}`);
  }

  console.log(`Searching for LambdaId name : ${fName}`);

  const targetObj = tl && tl.LambdaFunctions ? tl.LambdaFunctions.find(obj => {
    const tlName = obj.split(':');
    return tlName[6] === fName;
  }): undefined;

  if (targetObj) {
    rId = targetObj.split(':')[6];
    console.log(`Found lambda id : ${rId}`);
    return rId;
  } else {
    // console.log('create Lambda in targetInstance');
    console.log('Lambda Not Found Please Create Lambda');
    return undefined;
  }
}

function getQueueId(primary, queueId, target) {
  const pl = primary;
  const tl = target;
  let fName = '';
  let rId = '';

  console.log(`Searching for queueId : ${queueId}`);

  const primaryObj = pl && pl.QueueSummaryList ? pl.QueueSummaryList.find(obj => obj.Arn === queueId) : undefined;
  if (primaryObj) {
    fName = primaryObj.Name;
    console.log(`Found queue name : ${fName}`);
  }

  const targetObj = tl && tl.QueueSummaryList ? tl.QueueSummaryList.find(obj => obj.Name === fName) : undefined;
  if (targetObj) {
    rId = targetObj.Arn;
    console.log(`Found flow id : ${rId}`);
    return rId;
  } else {
    console.log('Queue Not Found Please Create queue');
    return undefined;
  }
}

function getUserId(primary, userId, target) {
  const pl = primary;
  const tl = target;
  let fName = '';
  let rId = '';

  console.log(`Searching for userId : ${userId}`);

  for (let i = 0; i < pl.UserSummaryList.length; i++) {
      const obj = pl.UserSummaryList[i];
      if (obj.Arn === userId) {
          fName = obj.Username;
          console.log(`Found user name : ${fName}`);
          break;
      }
  }

  console.log(`Searching for userId for : ${fName}`);

  for (let i = 0; i < tl.UserSummaryList.length; i++) {
      const obj = tl.UserSummaryList[i];
      if (obj.Username === fName) {
          rId = obj.Arn;
          console.log(`Found flow id : ${rId}`);
          return rId;
      } else if (i === tl.UserSummaryList.length - 1) {
          console.log('create user');
          return undefined;
      }
  }
}

function getHOPId(primary, hopId, target) {
  const pl = primary;
  const tl = target;
  let fName = '';
  let rId = '';

  console.log(`Searching for hopId : ${hopId}`);

  for (let i = 0; i < pl.HoursOfOperationSummaryList.length; i++) {
      const obj = pl.HoursOfOperationSummaryList[i];
      if (obj.Arn === hopId) {
          fName = obj.Name;
          console.log(`Found name : ${fName}`);
          break;
      }
  }

  console.log(`Searching for hopId for : ${fName}`);

  for (let i = 0; i < tl.HoursOfOperationSummaryList.length; i++) {
      const obj = tl.HoursOfOperationSummaryList[i];
      if (obj.Username === fName) {
          rId = obj.Arn;
          console.log(`Found id : ${rId}`);
          return rId;
      } else if (i === tl.HoursOfOperationSummaryList.length - 1) {
          console.log('HOP Not Found Please Create HOP');
          return undefined;
      }
  }
}

function getPromptId(primary, searchId, target) {
    const pl = primary;
    const tl = target;
    let fName = '';
    let rId = '';
  
    console.log(`Searching for promptId : ${searchId}`);
  
    const primaryObj = pl.PromptSummaryList.find(obj => obj.Arn === searchId);
    if (primaryObj) {
      fName = primaryObj.Name;
      console.log(`Found name : ${fName}`);
    }
  
    console.log(`Searching for prompt for : ${fName}`);
  
    const targetObj = tl && tl.PromptSummaryList ? tl.PromptSummaryList.find(obj => obj.Name === fName) : undefined;
    if (targetObj) {
      rId = targetObj.Arn;
      console.log(`Found id : ${rId}`);
      return rId;
    } else {
    //   console.log('prompt cant created');
      console.log('Prompt Not Found Please Create prompt');
      return undefined;
    }
}

function getLexBotId(primary, botId, target) {
    const pl = primary;
    const tl = target;
    let fName = '';
    let rId = '';
  
    console.log(`Searching for botId : ${botId}`);
  
    const primaryObj = pl && pl.LexBots ? pl.LexBots.find(obj => obj.Name === botId) : undefined;
    if (primaryObj) {
      fName = primaryObj.Name;
      console.log(`Found bot name : ${fName}`);
    }
  
    console.log(`Searching for bot name : ${fName}`);
  
    const targetObj = tl && tl.LexBots ? tl.LexBots.find(obj => obj.Name === fName) : undefined;
    if (targetObj) {
      rId = targetObj.Name;
      console.log(`Found bot : ${rId}`);
      return rId;
    } else {
      console.log('create bot in targetInstance');
      console.log('Bot Not Found Please Create Bot');
      return undefined;
    }
}


// const instanceIdParamList = {
//   InstanceId: INSTANCEARN // replace with your instance id
// };
// while (!(TARGETCFS.nextToken === '')) {
//   const token = PRIMARYCFS.nextToken;
//   instanceIdParamList['nextToken'] = token;
//   TARGETCFS='';
//   TARGETCFS =  await connect.listContactFlows(instanceIdParamList, function(err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else    { 
//             // console.log('PRIMARYCFS', data)
//             TARGETCFS = data;
//             };            // successful response
//   }).promise();

// const listcontactFlowFunc = async function(instanceIdParamList, context, retryAttempts) {
//   try {
//     let doRetry = false;
//     do {
//       doRetry = false;
//       try {
//         let listCFs = '';
//         await connect.listContactFlows(instanceIdParamList, function(err, data) {
//           if (err) console.log(err, err.stack); // an error occurred
//           else    { 
//                   // console.log('PRIMARYCFS', data)
//                   listCFs = data;
//                   };            // successful response
//         }).promise();
//         if (listCFs) {
//           return listCFs;
//         } else {
//           return null;
//         }
//       } catch (error) {
//         LOGGER.error(
//           'LambdaHandler::agentDetailsFunc::error::',
//           convertToSingleLine(error)
//         );
//         if (error.code === 'TooManyRequestsException' && retryAttempts > 0) {
//           await sleep(parseInt(process.env.API_RETRY_WAIT_TIME, 10) || 1000);
//           // return contactLensApi(event, --retryAttempts);
//           --retryAttempts;
//           LOGGER.info(
//             'LambdaHandler::agentDetailsFunc::retryAttempts::',
//             retryAttempts
//           );
//           doRetry = true;
//           LOGGER.info('LambdaHandler::agentDetailsFunc::doRetry::', doRetry);
//           LOGGER.info(
//             'LambdaHandler::agentDetailsFunc::Lambda remaining time in ms::',
//             context.getRemainingTimeInMillis()
//           );
//         } else {
//           return error;
//         }
//       }
//     } while (doRetry);
//   } catch (error) {
//     LOGGER.error('LambdaHandler::agentDetailsFunc::error::', error);
//     return error;
//   }
// };


