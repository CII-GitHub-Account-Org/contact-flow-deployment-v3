import AWS from 'aws-sdk';
const connect = new AWS.Connect();
import { config } from 'dotenv';
config();

const INSTANCEARN = 'arn:aws:connect:us-east-1:750344256621:instance/4bbee21d-72b8-442b-af39-dce4128ca77e';
const TRAGETINSTANCEARN = 'arn:aws:connect:us-east-1:750344256621:instance/561af6e6-7907-4131-9f18-71b466e8763e';
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
      await connect.listContactFlows(instanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('PRIMARYCFS', data)
                PRIMARYCFS = data;
                };            // successful response
      }).promise();
      await connect.listContactFlows(targetInstanceIdParam, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else    { 
                // console.log('TARGETCFS', data)
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
}

handleConnectAPI();

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
// console.log('Data:',data);
const flow = data;
const content = flow.ContactFlow.Content;
TARGETJSON = content;
// checkFlowArn(PRIMARYCFS, flow.ContactFlow.Arn, TARGETCFS);
const flowArn = flow.ContactFlow.Arn;
// console.log('flowArn: ', flowArn)
if (flowArn) {
    let flowArnSplit = flowArn.split('/');
    TARGETFLOWID = flowArnSplit[3];
    isExist = true;
    console.log(`Need to update flowId : ${TARGETFLOWID}`);
} else {
    isExist = false;
}

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
    console.log('lexbot');
    let arn = getlexbotId(PRIMARYBOT, obj.Parameters.LexBot.Name, TARGETBOT);
    // handle lex bot
  } else if (obj.Type === 'UpdateContactTargetQueue') {
    let arn = getQueueId(PRIMARYQUEUES, obj.Parameters.QueueId, TARGETQUEUES);
    if (arn) {TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.QueueId, 'g'), arn)};
  } 
  // else if (obj.Type === 'UpdateContactEventHooks') {
  //   if (obj.Parameters.EventHooks.AgentWhisper) {
  //     let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.AgentWhisper, TARGETCFS);
  //     TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.AgentWhisper, 'g'), arn);
  //   } else if (obj.Parameters.EventHooks.CustomerQueue) {
  //     let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.CustomerQueue, TARGETCFS);
  //     TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.CustomerQueue, 'g'), arn);
  //   } else if (obj.Parameters.EventHooks.CustomerRemaining) {
  //     let arn = getFlowId(PRIMARYCFS, obj.Parameters.EventHooks.CustomerRemaining, TARGETCFS);
  //     TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.EventHooks.CustomerRemaining, 'g'), arn);
  //   }
  // } else if (obj.Type === 'InvokeLambdaFunction') {
  //   let lambdaId = getLambdaId(PRIMARYLAMBDA, obj.Parameters.LambdaFunctionARN, TARGETLAMBDA);
  // } else if (obj.Type === 'TransferToFlow') {
  //   let arn = getFlowId(PRIMARYCFS, obj.Parameters.ContactFlowId, TARGETCFS);
  //   TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.ContactFlowId, 'g'), arn);
  // } else if (obj.Type === 'CheckHoursOfOperation') {
  //   let arn = getHOPId(PRIMARYHOP, obj.Parameters.HoursOfOperationId, TARGETHOP);
  //   TARGETJSON = TARGETJSON.replace(new RegExp(obj.Parameters.HoursOfOperationId, 'g'), arn);
  // } else {
  //   console.log(`No handling for ${JSON.stringify(obj.Parameters)} of type : ${obj.Type}`);
  // }
}

function checkFlowArn(primary, flowArn, target) {
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
      console.log('create queue');
      return undefined;
    }
  }