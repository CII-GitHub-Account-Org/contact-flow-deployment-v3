
import { LexModelsV2Client, DescribeBotCommand } from "@aws-sdk/client-lex-models-v2";
let regionToUse;

export default async function lexV2BotHandling(primaryLexBot, aliasArn, targetLexBot, region) {
    regionToUse = region;
    const lexV2BotName = await getlexV2BotName(aliasArn, region);
    console.log('lexV2BotName : ', lexV2BotName);

    if (!Array.isArray(primaryLexBot) || primaryLexBot.length === 0) {
      console.log('primaryLexBot is empty or not an array');
      return undefined;
    }
    
    const primaryLexV2BotName = await getlexV2BotName(aliasArn, regionToUse);
    console.log('primaryLexV2BotName : ', primaryLexV2BotName);
    

    let foundAliasArnInPrimary = false;
    primaryLexBot.forEach((item) => {
      if (item && item.LexBots){
          item.LexBots.forEach((item) => {
            if (item && item.LexV2Bot && item.LexV2Bot.AliasArn){
              if (item.LexV2Bot.AliasArn === aliasArn) {
                console.log('Found aliasArn in primaryLexBot');
                foundAliasArnInPrimary = true;
              }
            }    
            });
      }
    });
    if (!foundAliasArnInPrimary) {
      console.log('Not Found aliasArn in primaryLexBot');
      return undefined;
    } 
    
    if (!Array.isArray(targetLexBot) || targetLexBot.length === 0) {
      console.log('targetLexBot is empty or not an array');
      return undefined;
    }

    let foundAliasArnInTarget = false;
    let targetAliasArn;
    for (const item of targetLexBot) {
      if (item && item.LexBots) {
        for (const lexBot of item.LexBots) {
          if (lexBot && lexBot.LexV2Bot && lexBot.LexV2Bot.AliasArn) {
            const targetLexV2BotName = await getlexV2BotName(lexBot.LexV2Bot.AliasArn, regionToUse);
            if (targetLexV2BotName === primaryLexV2BotName) {
              console.log('Found aliasArn in targetLexBot');
              foundAliasArnInTarget = true;
              targetAliasArn = lexBot.LexV2Bot.AliasArn;
            }
          }
        }
      }
    }

    if (!foundAliasArnInTarget) {
      console.log('Not Found aliasArn in targetLexBot');
      return undefined;
    } else {
      return targetAliasArn;
    } 

  }

async function getlexV2BotName (aliasArn, region) {
    const client = new LexModelsV2Client({ region: region });
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