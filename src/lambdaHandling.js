let regionToUse;

export default async function leambdaHandling(primaryLambda, lambdaFunctionARN, targetLambda, region) {
    regionToUse = region;

    const parts = lambdaFunctionARN.split(":");
    const primaryLambdaName = parts[parts.length - 1];
    console.log('primaryLambdaName : ', primaryLambdaName);

    if (!Array.isArray(primaryLambda) || primaryLambda.length === 0) {
      console.log('primaryLambda is empty or not an array');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "lambda",
        "ResourceName": primaryLambdaName,
        "ResourceArn": lambdaFunctionARN
      };
    }

    console.log('primaryLambda : ', primaryLambda);
    // let foundLambdaFunctionARNInPrimary = false;
    // primaryLambda.forEach((item) => {
    //   if (item && item.LexBots){
    //       item.LexBots.forEach((item) => {
    //         if (item && item.LexV2Bot && item.LexV2Bot.AliasArn){
    //           if (item.LexV2Bot.AliasArn === aliasArn) {
    //             console.log('Found lambdaFunctionARN in primaryLambda');
    //             foundLambdaFunctionARNInPrimary = true;
    //           }
    //         }    
    //         });
    //   }
    // });
    // if (!foundAliasArnInPrimary) {
    //   console.log('Not Found aliasArn in primaryLexBot');
    //   return {
    //     "ResourceStatus": "notExists",
    //     "ResourceType": "lexV2Bot",
    //     "ResourceName": primaryLexV2BotName,
    //     "ResourceArn": aliasArn
    //   };;
    } 
    
    // if (!Array.isArray(targetLexBot) || targetLexBot.length === 0) {
    //   console.log('targetLexBot is empty or not an array');
    //   return {
    //     "ResourceStatus": "notExists",
    //     "ResourceType": "lexV2Bot",
    //     "ResourceName": primaryLexV2BotName,
    //     "ResourceArn": aliasArn
    //   };;
    // }

    // let foundAliasArnInTarget = false;
    // let targetAliasArn;
    // for (const item of targetLexBot) {
    //   if (item && item.LexBots) {
    //     for (const lexBot of item.LexBots) {
    //       if (lexBot && lexBot.LexV2Bot && lexBot.LexV2Bot.AliasArn) {
    //         const targetLexV2BotName = await getlexV2BotName(lexBot.LexV2Bot.AliasArn, regionToUse);
    //         if (targetLexV2BotName === primaryLexV2BotName) {
    //           console.log('Found aliasArn in targetLexBot');
    //           foundAliasArnInTarget = true;
    //           targetAliasArn = lexBot.LexV2Bot.AliasArn;
    //         }
    //       }
    //     }
    //   }
    // }

    // if (!foundAliasArnInTarget) {
    //   console.log('Not Found aliasArn in targetLexBot');
    //   return {
    //     "ResourceStatus": "notExists",
    //     "ResourceType": "lexV2Bot",
    //     "ResourceName": primaryLexV2BotName,
    //     "ResourceArn": aliasArn
    //   };
    // } else {
    //   return {
    //     "ResourceStatus": "exists",
    //     "TargetAliasArn": targetAliasArn
    //   };
    // } 

  }

