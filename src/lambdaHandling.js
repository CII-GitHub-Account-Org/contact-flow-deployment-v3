let regionToUse;

export default async function lambdaHandling(primaryLambda, lambdaFunctionARN, targetLambda, region) {
    regionToUse = region;

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

    let foundLambdaFunctionARNInPrimary = false;
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
