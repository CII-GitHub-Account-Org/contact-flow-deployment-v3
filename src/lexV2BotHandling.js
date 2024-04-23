
import { LexModelsV2Client, DescribeBotCommand, ListBotsCommand } from "@aws-sdk/client-lex-models-v2";
let regionToUse;

export default async function lexV2BotHandling(primaryLexBot, aliasArn, targetLexBot, region) {
    regionToUse = region;
   
    const primaryLexV2BotName = await getlexV2BotName(aliasArn, regionToUse);
    console.log('primaryLexV2BotName : ', primaryLexV2BotName);

    if (!Array.isArray(primaryLexBot) || primaryLexBot.length === 0) {
      console.log('primaryLexBot is empty or not an array');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "lexV2Bot",
        "ResourceName": primaryLexV2BotName,
        "ResourceArn": aliasArn
      };
    }
    
    let foundAliasArnInPrimary = false;
    outerLoop: // label for the outer loop
    for (const item of primaryLexBot) {
      if (item && item.LexBots) {
        for (const lexBot of item.LexBots) {
          if (lexBot && lexBot.LexV2Bot && lexBot.LexV2Bot.AliasArn) {
            if (lexBot.LexV2Bot.AliasArn === aliasArn) {
              console.log('Found aliasArn in primaryLexBot');
              foundAliasArnInPrimary = true;
              break outerLoop; // break the outer loop
            }
          }
        }
      }
    }
  
    if (!foundAliasArnInPrimary) {
      console.log('Not Found aliasArn in primaryLexBot');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "lexV2Bot",
        "ResourceName": primaryLexV2BotName,
        "ResourceArn": aliasArn
      };;
    } 
    
    if (!Array.isArray(targetLexBot) || targetLexBot.length === 0) {
      console.log('targetLexBot is empty or not an array');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "lexV2Bot",
        "ResourceName": primaryLexV2BotName,
        "ResourceArn": aliasArn
      };;
    }

    let foundAliasArnInTarget = false;
    let targetAliasArn;
    outerLoop: // label for the outer loop
    for (const item of targetLexBot) {
      if (item && item.LexBots) {
        for (const lexBot of item.LexBots) {
          if (lexBot && lexBot.LexV2Bot && lexBot.LexV2Bot.AliasArn) {
            const targetLexV2BotName = await getlexV2BotName(lexBot.LexV2Bot.AliasArn, regionToUse);
            if (targetLexV2BotName === primaryLexV2BotName) {
              console.log('Found aliasArn in targetLexBot');
              foundAliasArnInTarget = true;
              targetAliasArn = lexBot.LexV2Bot.AliasArn;
              break outerLoop; // break the outer loop
            }
          }
        }
      }
    }

    if (!foundAliasArnInTarget) {
     const listLexV2BotsResponse = await listLexV2Bots(regionToUse);
     console.log('listLexV2Bots : ', listLexV2BotsResponse);
    }

    if (!foundAliasArnInTarget) {
      console.log('Not Found aliasArn in targetLexBot');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "lexV2Bot",
        "ResourceName": primaryLexV2BotName,
        "ResourceArn": aliasArn
      };
    } else {
      return {
        "ResourceStatus": "exists",
        "TargetAliasArn": targetAliasArn
      };
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

async function listLexV2Bots (region) {
  const client = new LexModelsV2Client({ region: region });
  const inputListLexV2Bots = { // ListBotsRequest
    sortBy: { // BotSortBy
      attribute: "BotName", // required
      order: "Ascending", // required
    },
    maxResults: 10
  };
const commandListLexV2Bots = new ListBotsCommand(inputListLexV2Bots);
const responseListLexV2Bots = await client.send(commandListLexV2Bots);
return responseListLexV2Bots;
}