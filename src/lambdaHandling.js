import { LambdaClient, ListFunctionsCommand } from "@aws-sdk/client-lambda";
import writeDataToFile from './writeDataToFile.js';

export default async function lambdaHandling(primaryLambda, lambdaFunctionARN, targetLambda, sourceRegion, targetRegion) {

    const primaryLambdaName = lambdaFunctionARN.split(":")[6];
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

    let foundLambdaFunctionARNInPrimary = false; // flag to check if lambdaFunctionARN is found in primaryLambda
    outerLoop: // label for the outer loop
    for (const item of primaryLambda) {
        if (item && item.LambdaFunctions) {
            for (const lambdaFunction of item.LambdaFunctions) {
                if (lambdaFunction === lambdaFunctionARN) {
                    console.log('Found lambdaFunctionARN in primaryLambda');
                    foundLambdaFunctionARNInPrimary = true;
                    break outerLoop; // break the outer loop
                }
            }
        }
    }

    if (!foundLambdaFunctionARNInPrimary) {
      console.log('Not Found lambdaFunctionARN in primaryLambda');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "lambda",
        "ResourceName": primaryLambdaName,
        "ResourceArn": lambdaFunctionARN
      };;
    } 
    
    if (!Array.isArray(targetLambda) || targetLambda.length === 0) {
      console.log('targetLambda is empty or not an array');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "lambda",
        "ResourceName": primaryLambdaName,
        "ResourceArn": lambdaFunctionARN
      };
    }

    let foundLambdaFunctionARNInTarget = false;
    let targetLambdaFunctionARN;
    outerLoop: // label for the outer loop
    for (const item of targetLambda) {
        if (item && item.LambdaFunctions) {
            for (const lambdaArn of item.LambdaFunctions) {
                const targetLambdaName = lambdaArn.split(":")[6];
                // console.log('targetLambdaName : ', targetLambdaName);
                const primaryLambdaNameWithoutPrefix = primaryLambdaName.replace(/^[Dd][Ee][Vv]-/, '');
                if (targetLambdaName.toLowerCase() === `qa-${primaryLambdaNameWithoutPrefix}`.toLowerCase()) {
                    console.log('Found lambdaFunctionARN in targetLambda');
                    foundLambdaFunctionARNInTarget = true;
                    targetLambdaFunctionARN = lambdaArn;
                    break outerLoop; // break the outer loop
                }
            }
        }
    }

    // if (!foundLambdaFunctionARNInTarget) {
    //   const lambdaFunctionArns = await listLambdaFunctionArns(targetRegion);
    //   await writeDataToFile('lambdaFunctionArns.json', lambdaFunctionArns);
    //   for (const lambdaArn of lambdaFunctionArns) {
    //     const targetLambdaName = lambdaArn.split(":")[6];
    //     if (targetLambdaName === primaryLambdaName) {
    //       console.log('Found lambdaFunctionARN in listLambdaFunctionArns');
    //       foundLambdaFunctionARNInTarget = true;
    //       targetLambdaFunctionARN = lambdaArn;
    //       break;
    //     }
    //   }
    // }

    if (!foundLambdaFunctionARNInTarget) {
      console.log('Not Found lambdaFunctionARN in targetLambda');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "lambda",
        "ResourceName": primaryLambdaName,
        "ResourceArn": lambdaFunctionARN
      };
    } else {
      return {
        "ResourceStatus": "exists",
        "ResourceArn": targetLambdaFunctionARN
      };
    }
}

// Helper function to sleep for a given number of milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function listLambdaFunctionArns(targetRegion) {
  const lambdaClient = new LambdaClient({ region: targetRegion });
  let functionArns = [];
  let nextMarker;
  let retryAttempts = 3;

  do {
    try {
      const listFunctionsCommand = new ListFunctionsCommand({ Marker: nextMarker });
      const listFunctionsResponse = await lambdaClient.send(listFunctionsCommand);

      functionArns = functionArns.concat(listFunctionsResponse.Functions.map(func => func.FunctionArn));
      nextMarker = listFunctionsResponse.NextMarker;
    } catch (error) {
      console.log('error:', error);
      if (error.code === 'TooManyRequestsException' && retryAttempts > 0) {
        await sleep(2500);
        --retryAttempts;
        continue;
      } else {
        throw error;
      }
    }
  } while (nextMarker);

  return functionArns;
}
