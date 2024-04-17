import AWS from 'aws-sdk';
const lexModelsV2 = new AWS.LexModelsV2();
import { LexModelsV2Client, ListBotsCommand, ListBotAliasesCommand, DescribeBotCommand   } from "@aws-sdk/client-lex-models-v2";

const client = new LexModelsV2Client({ region: "us-east-1" });

export default async function lexV2BotHandling(primary, aliasArn, target) {

    const lexV2BotName = await getlexV2BotName(aliasArn);
    console.log('lexV2BotName', lexV2BotName);
    // let lexv2bots;
    // const commandListBotsCommand = new ListBotsCommand({
    //     sortBy: {
    //       attribute: "BotName",
    //       order: "Ascending"
    //     },
    //     maxResults: 200
    //   });
      
    //   client.send(commandListBotsCommand)
    //     .then((data) => {
    //         // console.log('lexv2bots', data);
    //         lexv2bots = data.botSummaries;
    //     })
    //     .catch(err => console.log(err, err.stack));


        // const inputListBotAliasesRequest = { // ListBotAliasesRequest
        //   botId: '88GUJWR4HL', // required
        //   maxResults: 200
        // };
        // const commandListBotAliasesRequest = new ListBotAliasesCommand(inputListBotAliasesRequest);
        // const response = await client.send(commandListBotAliasesRequest);
        // console.log('ListBotAliasesRequest', response);

 

    // const pl = primary;
    // const tl = target;
    // let fName = '';
    // let rId = '';
  
    // console.log(`Searching for botId : ${botId}`);
  
    // const primaryObj = pl && pl.LexBots ? pl.LexBots.find(obj => obj.Name === botId) : undefined;
    // if (primaryObj) {
    //   fName = primaryObj.Name;
    //   console.log(`Found bot name : ${fName}`);
    // }
  
    // console.log(`Searching for bot name : ${fName}`);
  
    // const targetObj = tl && tl.LexBots ? tl.LexBots.find(obj => obj.Name === fName) : undefined;
    // if (targetObj) {
    //   rId = targetObj.Name;
    //   console.log(`Found bot : ${rId}`);
    //   return rId;
    // } else {
    //   console.log('create bot in targetInstance');
    //   console.log('Bot Not Found Please Create Bot');
    //   return undefined;
    // }
}

async function getlexV2BotName (aliasArn) {
  const botId = aliasArn.split('/')[1];
  const inputDescribeBotRequest = { // DescribeBotRequest
    botId: botId, // required
  };
  // console.log('inputDescribeBotRequest', inputDescribeBotRequest);
  const commandDescribeBotRequest = new DescribeBotCommand(inputDescribeBotRequest);
  const responseDescribeBotRequest = await client.send(commandDescribeBotRequest);
  // console.log('DescribeBotRequest', responseDescribeBotRequest);
  const botName = responseDescribeBotRequest.botName;
  return botName;
}



