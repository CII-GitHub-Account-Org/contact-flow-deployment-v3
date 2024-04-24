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
                if (targetLambdaName === primaryLambdaName) {
                    console.log('Found lambdaFunctionARN in targetLambda');
                    foundLambdaFunctionARNInTarget = true;
                    targetLambdaFunctionARN = lambdaArn;
                    break outerLoop; // break the outer loop
                }
            }
        }
    }


    if (!foundLambdaFunctionARNInTarget) {
      const lambdaFunctionArns = await listLambdaFunctionArns(targetRegion);
      await writeDataToFile('lambdaFunctionArns.json', lambdaFunctionArns);
    }

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

async function listLambdaFunctionArns(targetRegion) {
  const lambdaClient = new LambdaClient({ region: targetRegion });
  let functionArns = [];
  let nextMarker;

  do {
    const listFunctionsCommand = new ListFunctionsCommand({ Marker: nextMarker });
    const listFunctionsResponse = await lambdaClient.send(listFunctionsCommand);

    functionArns = functionArns.concat(listFunctionsResponse.Functions.map(func => func.FunctionArn));
    nextMarker = listFunctionsResponse.NextMarker;
  } while (nextMarker);

  return functionArns;
}
