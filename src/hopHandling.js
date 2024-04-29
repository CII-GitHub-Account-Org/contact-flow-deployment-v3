

export default async function hopHandling(primaryHOP, hopArn, targetHOP) {

    let primaryHopName;
     console.log('primaryHopName : ', primaryHopName);

    if (!Array.isArray(primaryHOP) || primaryHOP.length === 0) {
      console.log('primaryHOP is empty or not an array');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "hop",
        "ResourceName": null,
        "ResourceArn": hopArn
      };
    }

    let foundhopArnInPrimary = false;
    outerLoop: // label for the outer loop
    for (const item of primaryHOP) {
        if (item && item.hopSummaryList) {
            for (const hop of item.hopSummaryList) {
                if (hop.Arn === hopArn) {
                    console.log('Found hopArn in primaryHOP');
                    foundhopArnInPrimary = true;
                    primaryHopName = hop.Name;
                    break outerLoop; // break the outer loop
                }
            }
        }
    }

    if (!foundhopArnInPrimary) {
      console.log('Not Found hopArn in primaryHOP');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "hop",
        "ResourceName": primaryHopName,
        "ResourceArn": hopArn
      };;
    } 
    
    if (!Array.isArray(hopQueues) || hopQueues.length === 0) {
      console.log('hopQueues is empty or not an array');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "hop",
        "ResourceName": primaryHopName,
        "ResourceArn": hopArn
      };
    }

    let foundhopArnInTarget = false;
    let targethopArn;
    outerLoop: // label for the outer loop
    for (const item of targetHOP) {
        if (item && item.hopSummaryList) {
            for (const hop of item.hopSummaryList) {
                const targethopName = hop.Name;
                if (targethopName === primaryHopName) {
                    console.log('Found hopArn in targetHOP');
                    foundhopArnInTarget = true;
                    targethopArn = hop.Arn;
                    break outerLoop; // break the outer loop
                }
            }
        }
    }

    if (!foundhopArnInTarget) {
      console.log('Not Found hopArn in targetHOP ');
      return {
        "ResourceStatus": "notExists",
        "ResourceType": "hop",
        "ResourceName": primaryHopName,
        "ResourceArn": hopArn
      };
    } else {
      return {
        "ResourceStatus": "exists",
        "ResourceArn": targethopArn
      };
    } 

}




// obj :  {
//     Parameters: {
//       HoursOfOperationId: 'arn:aws:connect:us-east-1:***:instance/4bbee21d-72b8-442b-af39-dce4128ca77e/operating-hours/66d9dac1-bc4c-434e-b2b2-d0809e41eb85'
//     },
//     Identifier: 'e4df3fca-ea50-43cb-9334-52cfcaf74b96',
//     Type: 'CheckHoursOfOperation',
//     Transitions: {
//       NextAction: '11a9b95b-a27d-46aa-a828-b7bf4b9e65c9',
//       Conditions: [ [Object], [Object] ],
//       Errors: [ [Object] ]
//     }
//   }

