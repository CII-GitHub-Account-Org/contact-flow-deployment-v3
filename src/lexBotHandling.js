import AWS from 'aws-sdk';
const lexmodelbuildingservice = new AWS.LexModelBuildingService();

export default async function lexBotHandling(primary, botId, target) {

    const aliasArn = "arn:aws:lex:us-east-1:750344256621:bot-alias/88GUJWR4HL/HNDLCSYFMP";

    // List all bots
        lexmodelbuildingservice.getBots({}, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else {
            // For each bot
            for (let bot of data.bots) {
                // Get the bot's aliases
                lexmodelbuildingservice.getBotAliases({name: bot.name}, function(err, aliasesData) {
                if (err) console.log(err, err.stack); // an error occurred
                else {
                    // For each alias
                    for (let alias of aliasesData.BotAliases) {
                    // If the alias ARN matches
                    if (alias.botAliasArn === aliasArn) {
                        // Print the bot name
                        console.log(bot.name);
                    }
                    }
                }
                });
            }
            }
        });

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




