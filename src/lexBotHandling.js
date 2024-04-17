import AWS from 'aws-sdk';
const lexModelsV2 = new AWS.LexModelsV2();
const { LexModelsV2Client, ListBotsCommand } = require("@aws-sdk/client-lex-models-v2");

const client = new LexModelsV2Client({ region: "us-east-1" });

export default async function lexBotHandling(primary, botId, target) {

    const aliasArn = "arn:aws:lex:us-east-1:750344256621:bot-alias/88GUJWR4HL/HNDLCSYFMP";


    const command = new ListBotsCommand({
        sortBy: {
          attribute: "BotName",
          order: "Ascending"
        },
        maxResults: 10
      });
      
      client.send(command)
        .then(data => console.log('lexv2bots', data))
        .catch(err => console.log(err, err.stack));

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




