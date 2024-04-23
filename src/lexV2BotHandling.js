
import { LexModelsV2Client, DescribeBotCommand, ListBotsCommand } from "@aws-sdk/client-lex-models-v2";
let regionToUse;
import writeDataToFile from './writeDataToFile.js';

export default async function lexV2BotHandling(primaryLexBot, aliasArn, targetLexBot, region) {
    regionToUse = region;
   
    const primaryLexV2BotId = aliasArn.split('/')[1];
    console.log('primaryLexV2BotId : ', primaryLexV2BotId);
    const describeLexV2BotResponse = await describeLexV2Bot(primaryLexV2BotId, regionToUse);
    const primaryLexV2BotName = describeLexV2BotResponse.botName;
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
    outerLoop1: // label for the outer loop
    for (const item of primaryLexBot) {
      if (item && item.LexBots) {
        for (const lexBot of item.LexBots) {
          if (lexBot && lexBot.LexV2Bot && lexBot.LexV2Bot.AliasArn) {
            if (lexBot.LexV2Bot.AliasArn === aliasArn) {
              console.log('Found aliasArn in primaryLexBot');
              foundAliasArnInPrimary = true;
              break outerLoop1; // break the outer loop
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
    outerLoop2: // label for the outer loop
    for (const item of targetLexBot) {
      if (item && item.LexBots) {
        for (const lexBot of item.LexBots) {
          if (lexBot && lexBot.LexV2Bot && lexBot.LexV2Bot.AliasArn) {
            const describeLexV2BotRes = await describeLexV2Bot(lexBot.LexV2Bot.AliasAr.split('/')[1];, regionToUse);
            const targetLexV2BotName = describeLexV2BotRes.botName;
            console.log('targetLexV2BotName : ', targetLexV2BotName);
            if (targetLexV2BotName === primaryLexV2BotName) {
              console.log('Found aliasArn in targetLexBot');
              foundAliasArnInTarget = true;
              targetAliasArn = lexBot.LexV2Bot.AliasArn;
              break outerLoop2; // break the outer loop
            }
          }
        }
      }
    }

    if (!foundAliasArnInTarget) {
      const inputListLexV2Bots = { // ListBotsRequest
        sortBy: { // BotSortBy
          attribute: "BotName", // required
          order: "Ascending", // required
        },
        maxResults: 10
      };
    const listLexV2BotsResponse = await listLexV2BotsFunc(regionToUse,inputListLexV2Bots);
      // Writing missedResourcesInTarget to files
      await writeDataToFile('listLexV2BotsResponse.json', listLexV2BotsResponse);
      outerLoop: // label for the outer loop
      for (const item of listLexV2BotsResponse) {
        if (item && item.botSummaries) {
          for (const lexBot of item.botSummaries) {
              const botName = lexBot.botName;
              console.log('botName : ', botName);
              if (botName === primaryLexV2BotName) {
                console.log('Found botName in listLexV2BotsResponse');
                const botId = lexBot.botId;
                const describeLexV2BotRes = await describeLexV2Bot(botId, regionToUse);
                console.log('describeLexV2BotRes', describeLexV2BotRes);
                // const targetLexV2BotName = describeLexV2BotRes.botName;
                // foundAliasArnInTarget = true;
                // targetAliasArn = lexBot.LexV2Bot.AliasArn;
                break outerLoop; // break the outer loop
              }
          }
        }
      }
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

async function describeLexV2Bot (botId, region) {
    const client = new LexModelsV2Client({ region: region });
    const inputDescribeBotRequest = { // DescribeBotRequest
      botId: botId, // required
    };
    // console.log('inputDescribeBotRequest', inputDescribeBotRequest);
    const commandDescribeBotRequest = new DescribeBotCommand(inputDescribeBotRequest);
    const responseDescribeBotRequest = await client.send(commandDescribeBotRequest);
    // console.log('DescribeBotRequest', responseDescribeBotRequest);
    // const botName = responseDescribeBotRequest.botName;
    return responseDescribeBotRequest;
}

async function listLexV2Bots (region,params) {
  let responseListLexV2Bots = [];
  const client = new LexModelsV2Client({ region: region });
  let commandListLexV2Bots = new ListBotsCommand(params);
  let response = await client.send(commandListLexV2Bots);
  responseListLexV2Bots.push(response);
  while (response.nextToken) {
    params.nextToken = response.nextToken;
    commandListLexV2Bots = new ListBotsCommand(params);
    response = await client.send(commandListLexV2Bots);
    responseListLexV2Bots.push(response);
  }
  return responseListLexV2Bots;
}

  // Helper function to handle throttling
  export async function listLexV2BotsFunc(region, params) {
    try {
      let doRetry = false;
      do {
        doRetry = false;
        try {
          const listResources = await listLexV2Bots(region, params);
          if (listResources) {
            return listResources;
          } else {
            return null;
          }
        } catch (error) {
          console.log('error:', error);
          if (error.code === 'TooManyRequestsException' && (retryAttempts || 3) > 0) {
            await sleep(parseInt(2500, 10) || 1000);
            --retryAttempts;
            doRetry = true;
            console.log('doRetry:', doRetry);
          } else {
            return error;
          }
        }
      } while (doRetry);
    } catch (error) {
      console.log('error:', error);
      return error;
    }
  };