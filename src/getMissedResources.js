
export default async function getMissedResources(contentActions, primaryQueues, targetQueues, 
    primaryHOP, targetHOP, primaryLexBot, targetLexBot, primaryLambda, targetLambda, sourceRegion, targetRegion) {
    
    const missedResourcesInTarget = [];

    for (let i = 0; i < contentActions.length; i++) {
        let obj = contentActions[i];
        console.log(`Type value: ${obj.Type}`);
            if (obj.Type === 'UpdateContactTargetQueue') {
              console.log('Inside Queue Handling');
              const queueArn = obj && obj.Parameters && obj.Parameters.QueueId ? obj.Parameters.QueueId : undefined;
              console.log('queueArn : ', queueArn);
              const targetQueueResources = await queueHandling(primaryQueues, queueArn, targetQueues);
              console.log('targetQueueResources : ', targetQueueResources);
              if (targetQueueResources && targetQueueResources.ResourceStatus === 'exists') {
                targetJson = targetJson.replace(new RegExp(queueArn, 'g'), targetQueueResources.ResourceArn);
              } else if (targetQueueResources && targetQueueResources.ResourceStatus === 'notExists') {
                missedResourcesInTarget.push({
                  "ResourceType": targetQueueResources.ResourceType,
                  "ResourceName": targetQueueResources.ResourceName,
                  "ResourceArn": targetQueueResources.ResourceArn
                });
              }
            } else if (obj.Type === 'CheckHoursOfOperation') {
              console.log('Inside HOP Handling');
              // console.log('obj : ', obj);
              const hopArn = obj && obj.Parameters && obj.Parameters.HoursOfOperationId ? obj.Parameters.HoursOfOperationId : undefined;
              console.log('hopArn : ', hopArn);
              const targetHopResources = await hopHandling(primaryHOP, hopArn, targetHOP);
              console.log('targetHopResources : ', targetHopResources);
              if (targetHopResources && targetHopResources.ResourceStatus === 'exists') {
                targetJson = targetJson.replace(new RegExp(hopArn, 'g'), targetHopResources.ResourceArn);
              } else if (targetHopResources && targetHopResources.ResourceStatus === 'notExists') {
                missedResourcesInTarget.push({
                  "ResourceType": targetHopResources.ResourceType,
                  "ResourceName": targetHopResources.ResourceName,
                  "ResourceArn": targetHopResources.ResourceArn
                });
              }
            } else if (obj.Type === 'ConnectParticipantWithLexBot') {
              console.log('Inside LexBot Handling');
              const lexV2BotAliasArn = obj && obj.Parameters && obj.Parameters.LexV2Bot && obj.Parameters.LexV2Bot.AliasArn ? obj.Parameters.LexV2Bot.AliasArn : undefined;
              console.log('lexV2BotAliasArn : ', lexV2BotAliasArn);
              const targetLexV2BotResources = await lexV2BotHandling(primaryLexBot, lexV2BotAliasArn, targetLexBot, sourceRegion, targetRegion);
              console.log('targetLexV2BotResources : ', targetLexV2BotResources);
              if (targetLexV2BotResources && targetLexV2BotResources.ResourceStatus === 'exists') {
                  targetJson = targetJson.replace(new RegExp(lexV2BotAliasArn, 'g'), targetLexV2BotResources.ResourceArn);
                  targetJson = targetJson.replace(new RegExp(targetLexV2BotResources.ResourceNameSource, 'g'), targetLexV2BotResources.ResourceNameTarget);
              } else if (targetLexV2BotResources && targetLexV2BotResources.ResourceStatus === 'notExists') {
                missedResourcesInTarget.push({
                  "ResourceType": targetLexV2BotResources.ResourceType,
                  "ResourceName": targetLexV2BotResources.ResourceName,
                  "ResourceArn": targetLexV2BotResources.ResourceArn
                });
              }
            } else if (obj.Type === 'InvokeLambdaFunction') {
              console.log('Inside Lambda Handling');
              const lambdaFunctionARN = obj && obj.Parameters && obj.Parameters.LambdaFunctionARN ? obj.Parameters.LambdaFunctionARN : undefined;
              console.log('lambdaFunctionARN : ', lambdaFunctionARN);
              const primaryLambdaName = lambdaFunctionARN.split(":")[6];
              const targetLambdaResources = await lambdaHandling(primaryLambda, lambdaFunctionARN, targetLambda, sourceRegion, targetRegion);
              console.log('targetLambdaResources : ', targetLambdaResources);
              if (targetLambdaResources && targetLambdaResources.ResourceStatus === 'exists') {
                  targetJson = targetJson.replace(new RegExp(lambdaFunctionARN, 'g'), targetLambdaResources.ResourceArn);
                  targetJson = targetJson.replace(new RegExp(primaryLambdaName, 'g'), targetLambdaResources.ResourceName);
              } else if (targetLambdaResources && targetLambdaResources.ResourceStatus === 'notExists') {
                missedResourcesInTarget.push({
                  "ResourceType": targetLambdaResources.ResourceType,
                  "ResourceName": targetLambdaResources.ResourceName,
                  "ResourceArn": targetLambdaResources.ResourceArn
                });
              }
            } else {
              console.log(`No handling for the type : ${obj.Type}`);
            }
    }

    return missedResourcesInTarget;
}